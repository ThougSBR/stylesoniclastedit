import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Image,
} from "react-native";
import { auth } from "../../services/firebaseConfig";
import {
  getFriendsList,
  getIncomingRequests,
  getOutgoingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  sendFriendRequest,
  searchUsersByUsername,
  isAlreadyFriend,
  isRequestAlreadySent,
  unfriendUser,
} from "../../services/friendService";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons"; // Import icons
import { getUserDetails } from "../../services/userService"; // Import the new function
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

interface Post {
  id: string;
  userId: string;
  userName: string;
  imageUrl: string;
  caption: string;
  timestamp: Date;
  likes: number;
}

const FriendsScreen = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("friends");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchFriends(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchFriends = async (userId: string) => {
    try {
      const friendsList = await getFriendsList(userId);
      const incomingRequests = await getIncomingRequests(userId);
      const outgoingRequests = await getOutgoingRequests(userId);

      // Fetch friend details from the users collection
      const friendsDetails = await Promise.all(
        friendsList.map(async (friend) => {
          const userDetails = await getUserDetails(friend.friendId);
          return { ...userDetails, friendId: friend.friendId };
        })
      );

      setFriends(friendsDetails);
      setIncomingRequests(incomingRequests);
      setOutgoingRequests(outgoingRequests);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchUsersByUsername(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (toUser: any) => {
    try {
      setButtonLoading(true);
      if (!currentUser) return;

      if (currentUser.uid === toUser.id) {
        alert("You cannot send a friend request to yourself.");
        return;
      }

      const alreadyFriend = await isAlreadyFriend(currentUser.uid, toUser.id);
      if (alreadyFriend) {
        alert("You are already friends with this user.");
        return;
      }

      const alreadyRequested = await isRequestAlreadySent(
        currentUser.uid,
        toUser.id
      );
      if (alreadyRequested) {
        alert("You have already sent a friend request to this user.");
        return;
      }

      await sendFriendRequest(
        currentUser.uid,
        toUser.id,
        currentUser.displayName || "Unknown",
        toUser.fullName
      );
      alert(`Friend request sent to ${toUser.username}`);

      // Update outgoing requests state immediately
      setOutgoingRequests((prevRequests) => [
        ...prevRequests,
        {
          toUserId: toUser.id,
          toUsername: toUser.username,
          toFullName: toUser.fullName,
        },
      ]);
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    try {
      setButtonLoading(true);
      if (!currentUser) return;
      await unfriendUser(currentUser.uid, friendId);
      alert("Friend removed.");
      fetchFriends(currentUser.uid);
    } catch (error) {
      console.error("Error unfriending user:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleCancelRequest = async (toUserId: string) => {
    try {
      setButtonLoading(true);
      if (!currentUser) return;
      await declineFriendRequest(toUserId, currentUser.uid);
      alert("Friend request canceled.");

      // Update outgoing requests state immediately
      setOutgoingRequests((prevRequests) =>
        prevRequests.filter((request) => request.toUserId !== toUserId)
      );
    } catch (error) {
      console.error("Error canceling friend request:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleAcceptRequest = async (
    fromUserId: string,
    fromUsername: string,
    fromFullName: string
  ) => {
    try {
      setButtonLoading(true);
      if (!currentUser) return;
      await acceptFriendRequest(
        currentUser.uid,
        fromUserId,
        fromUsername,
        fromFullName
      );
      alert("Friend request accepted.");

      // Update friends and incoming requests state immediately
      setFriends((prevFriends) => [
        ...prevFriends,
        {
          friendId: fromUserId,
          username: fromUsername,
          fullName: fromFullName,
        },
      ]);
      setIncomingRequests((prevRequests) =>
        prevRequests.filter((request) => request.fromUserId !== fromUserId)
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleDeclineRequest = async (fromUserId: string) => {
    try {
      setButtonLoading(true);
      if (!currentUser) return;
      await declineFriendRequest(currentUser.uid, fromUserId);
      alert("Friend request declined.");

      // Update incoming requests state immediately
      setIncomingRequests((prevRequests) =>
        prevRequests.filter((request) => request.fromUserId !== fromUserId)
      );
    } catch (error) {
      console.error("Error declining friend request:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const toggleSection = (section: string) => {
    setActiveSection(section);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const fetchPosts = async () => {
    try {
      const db = getFirestore();
      const postsRef = collection(db, "posts");
      const q = query(postsRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const postsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Post[];

      setPosts(postsList);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleLike = async (postId: string) => {
    // TODO: Implement like functionality
  };

  if (loading) return <ActivityIndicator size="large" color="#A0A897" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeSection === "feed" && styles.activeTabButton,
          ]}
          onPress={() => toggleSection("feed")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeSection === "feed" && styles.activeTabButtonText,
            ]}
          >
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeSection === "friends" && styles.activeTabButton,
          ]}
          onPress={() => toggleSection("friends")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeSection === "friends" && styles.activeTabButtonText,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeSection === "outgoingRequests" && styles.activeTabButton,
          ]}
          onPress={() => toggleSection("outgoingRequests")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeSection === "outgoingRequests" &&
                styles.activeTabButtonText,
            ]}
          >
            Sent Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeSection === "incomingRequests" && styles.activeTabButton,
          ]}
          onPress={() => toggleSection("incomingRequests")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeSection === "incomingRequests" &&
                styles.activeTabButtonText,
            ]}
          >
            Pending Requests
          </Text>
        </TouchableOpacity>
      </View>

      {activeSection === "feed" && (
        <ScrollView
          style={styles.feedContainer}
          contentContainerStyle={styles.feedContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.title}>Friends Feed</Text>

          {posts.map((post) => (
            <View key={post.id} style={styles.postContainer}>
              <View style={styles.postHeader}>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.timestamp}>
                  {post.timestamp.toLocaleDateString()}
                </Text>
              </View>

              <Image
                source={{ uri: post.imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
              />

              <View style={styles.postFooter}>
                <Text style={styles.caption}>{post.caption}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {activeSection === "friends" && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.friendId}
          renderItem={({ item }) => (
            <View style={styles.friendItemContainer}>
              <Text style={styles.text}>
                {item.fullName} (@{item.username})
              </Text>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleUnfriend(item.friendId)}
                disabled={buttonLoading}
              >
                {buttonLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons
                    name="person-remove"
                    size={15}
                    color="rgba(255, 255, 255, 1.0)"
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {activeSection === "incomingRequests" && (
        <FlatList
          data={incomingRequests}
          keyExtractor={(item) => item.fromUserId}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text style={styles.text}>
                {item.fromFullName} (@{item.fromUsername})
              </Text>
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    handleAcceptRequest(
                      item.fromUserId,
                      item.fromUsername,
                      item.fromFullName
                    )
                  }
                  disabled={buttonLoading}
                >
                  {buttonLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Ionicons
                      name="checkmark"
                      size={15}
                      color="rgba(255, 255, 255, 1.0)"
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleDeclineRequest(item.fromUserId)}
                  disabled={buttonLoading}
                >
                  {buttonLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Ionicons
                      name="close"
                      size={15}
                      color="rgba(255, 255, 255, 1.0)"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {activeSection === "outgoingRequests" && (
        <FlatList
          data={outgoingRequests}
          keyExtractor={(item) => item.toUserId}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text style={styles.text}>
                {item.toFullName} (@{item.toUsername})
              </Text>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleCancelRequest(item.toUserId)}
                disabled={buttonLoading}
              >
                {buttonLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons
                    name="close"
                    size={15}
                    color="rgba(255, 255, 255, 1.0)"
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#C2C2C2" />
        <TextInput
          placeholder="Search by username..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
          placeholderTextColor="#C2C2C2"
        />
        {searchTerm !== "" && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons name="close-circle" size={20} color="#C2C2C2" />
          </TouchableOpacity>
        )}
      </View>

      {searching && <ActivityIndicator size="small" color="#A0A897" />}
      {searchResults.length > 0 && searchTerm.trim() !== "" && (
        <ScrollView style={styles.searchDropdown}>
          {searchResults.map((item) => {
            const isCurrentUser = currentUser?.uid === item.id;
            const isFriend = friends.some(
              (friend) => friend.friendId === item.id
            );
            const isRequested = outgoingRequests.some(
              (request) => request.toUserId === item.id
            );

            return (
              <View key={item.id} style={styles.searchItem}>
                <Text style={styles.text}>
                  {item.fullName} (@{item.username})
                </Text>
                {!isCurrentUser && !isFriend && !isRequested && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleSendRequest(item)}
                    disabled={buttonLoading}
                  >
                    {buttonLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Ionicons
                        name="person-add"
                        size={15}
                        color="rgba(255, 255, 255, 1.0)"
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: "#FFC1A1",
    fontFamily: "PlayfairDisplay",
    margin: "auto",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D3D33",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    padding: 10,
  },
  searchDropdown: {
    maxHeight: 200,
    backgroundColor: "#2D3D33",
    borderRadius: 8,
    marginBottom: 10,
  },
  searchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  addFriendButton: {
    backgroundColor: "#c2e1ec7c",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, color: "#A0A897", marginTop: 20 },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  friendItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  friendItem: { color: "#FFF", fontSize: 16, marginVertical: 5 },
  unfriendButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  buttons: { flexDirection: "row" },
  acceptButton: {
    backgroundColor: "green",
    padding: 10,
    marginRight: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "red",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: { color: "#FFF" },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "#1C2C22",
    paddingTop: 10,
  },
  tabButton: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#A0A897",
  },
  tabButtonText: {
    color: "#A0A897",
    fontSize: 16,
  },
  activeTabButtonText: {
    fontWeight: "bold",
  },
  text: { color: "#FFF", fontSize: 16 },
  iconButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#2D3D33",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  postContainer: {
    backgroundColor: "#A0A897",
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2C22",
  },
  timestamp: {
    fontSize: 12,
    color: "#1C2C22",
  },
  postImage: {
    width: "100%",
    height: 300,
  },
  postFooter: {
    padding: 10,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  likeCount: {
    marginLeft: 5,
    color: "#1C2C22",
  },
  caption: {
    color: "#1C2C22",
    fontSize: 14,
  },
  feedContainer: {
    flex: 1,
    backgroundColor: "#1C2C22",
  },
  feedContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default FriendsScreen;
