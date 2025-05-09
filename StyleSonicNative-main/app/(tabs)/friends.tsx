import React, { useState, useEffect } from "react"; // Importing React and necessary hooks
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
} from "react-native"; // Importing core React Native components
import { auth } from "../../services/firebaseConfig"; // Importing Firebase authentication
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
} from "../../services/friendService"; // Importing friend management functions
import { onAuthStateChanged } from "firebase/auth"; // Importing Firebase auth state change listener
import { Ionicons } from "@expo/vector-icons"; // Importing Ionicons for icons
import { getUserDetails } from "../../services/userService"; // Importing user details fetching function
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore"; // Importing Firestore functions to fetch posts

// Defining the Post interface to type posts data
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
  // States for handling the app logic
  const [currentUser, setCurrentUser] = useState<any>(null); // Store current user data
  const [friends, setFriends] = useState<any[]>([]); // Store friends list
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]); // Store incoming friend requests
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]); // Store outgoing friend requests
  const [searchTerm, setSearchTerm] = useState(""); // Store the search term
  const [searchResults, setSearchResults] = useState<any[]>([]); // Store search results
  const [loading, setLoading] = useState(true); // Loading state
  const [searching, setSearching] = useState(false); // Searching state
  const [refreshing, setRefreshing] = useState(false); // Refreshing state for pull-to-refresh
  const [buttonLoading, setButtonLoading] = useState(false); // Button loading state for requests
  const [activeSection, setActiveSection] = useState("friends"); // State for managing active sections (feed, friends, etc.)
  const [posts, setPosts] = useState<Post[]>([]); // State to store posts

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Set current user on authentication state change
        fetchFriends(user.uid); // Fetch friends, incoming, and outgoing requests
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  // Function to fetch the friends, incoming, and outgoing requests
  const fetchFriends = async (userId: string) => {
    try {
      const friendsList = await getFriendsList(userId); // Get the list of friends
      const incomingRequests = await getIncomingRequests(userId); // Get incoming requests
      const outgoingRequests = await getOutgoingRequests(userId); // Get outgoing requests

      // Fetch friend details from the users collection
      const friendsDetails = await Promise.all(
        friendsList.map(async (friend) => {
          const userDetails = await getUserDetails(friend.friendId); // Get details for each friend
          return { ...userDetails, friendId: friend.friendId }; // Return combined data
        })
      );

      setFriends(friendsDetails); // Set the friends state
      setIncomingRequests(incomingRequests); // Set the incoming requests state
      setOutgoingRequests(outgoingRequests); // Set the outgoing requests state
    } catch (error) {
      console.error("Error fetching friends:", error); // Log any errors
    } finally {
      setLoading(false); // Set loading to false once data is fetched
      setRefreshing(false); // Set refreshing to false after pull-to-refresh completes
    }
  };

  // Function to handle search logic
  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]); // Clear search results if search term is empty
      return;
    }
    setSearching(true); // Set searching state to true when a search starts
    try {
      const results = await searchUsersByUsername(searchTerm); // Search users by username
      setSearchResults(results); // Set the search results state
    } catch (error) {
      console.error("Error searching users:", error); // Log search errors
    } finally {
      setSearching(false); // Set searching state to false after search completes
    }
  };

  // Function to handle sending a friend request
  const handleSendRequest = async (toUser: any) => {
    try {
      setButtonLoading(true); // Set button loading state while sending request
      if (!currentUser) return; // Return if the current user is not available

      if (currentUser.uid === toUser.id) {
        alert("You cannot send a friend request to yourself."); // Prevent self-requests
        return;
      }

      const alreadyFriend = await isAlreadyFriend(currentUser.uid, toUser.id); // Check if already friends
      if (alreadyFriend) {
        alert("You are already friends with this user."); // Alert if already friends
        return;
      }

      const alreadyRequested = await isRequestAlreadySent(
        currentUser.uid,
        toUser.id
      ); // Check if a request is already sent
      if (alreadyRequested) {
        alert("You have already sent a friend request to this user."); // Alert if already requested
        return;
      }

      await sendFriendRequest(
        currentUser.uid,
        toUser.id,
        currentUser.displayName || "Unknown",
        toUser.fullName
      ); // Send the friend request
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
      console.error("Error sending friend request:", error); // Log any errors
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  // Function to handle unfriending a user
  const handleUnfriend = async (friendId: string) => {
    try {
      setButtonLoading(true); // Set button loading while unfriending
      if (!currentUser) return; // Return if current user is not available
      await unfriendUser(currentUser.uid, friendId); // Unfriend the user
      alert("Friend removed.");
      fetchFriends(currentUser.uid); // Fetch updated friends list
    } catch (error) {
      console.error("Error unfriending user:", error); // Log any errors
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  // Function to handle canceling a sent friend request
  const handleCancelRequest = async (toUserId: string) => {
    try {
      setButtonLoading(true); // Set button loading while canceling request
      if (!currentUser) return; // Return if current user is not available
      await declineFriendRequest(toUserId, currentUser.uid); // Cancel the friend request
      alert("Friend request canceled.");

      // Update outgoing requests state immediately
      setOutgoingRequests((prevRequests) =>
        prevRequests.filter((request) => request.toUserId !== toUserId)
      );
    } catch (error) {
      console.error("Error canceling friend request:", error); // Log any errors
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  // Function to handle accepting a friend request
  const handleAcceptRequest = async (
    fromUserId: string,
    fromUsername: string,
    fromFullName: string
  ) => {
    try {
      setButtonLoading(true); // Set button loading while accepting request
      if (!currentUser) return; // Return if current user is not available
      await acceptFriendRequest(
        currentUser.uid,
        fromUserId,
        fromUsername,
        fromFullName
      ); // Accept the friend request
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
      console.error("Error accepting friend request:", error); // Log any errors
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  // Function to handle declining a friend request
  const handleDeclineRequest = async (fromUserId: string) => {
    try {
      setButtonLoading(true); // Set button loading while declining request
      if (!currentUser) return; // Return if current user is not available
      await declineFriendRequest(currentUser.uid, fromUserId); // Decline the friend request
      alert("Friend request declined.");

      // Update incoming requests state immediately
      setIncomingRequests((prevRequests) =>
        prevRequests.filter((request) => request.fromUserId !== fromUserId)
      );
    } catch (error) {
      console.error("Error declining friend request:", error); // Log any errors
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  // Function to handle pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing state to true
    await fetchPosts(); // Fetch posts again on refresh
    setRefreshing(false); // Set refreshing state to false after posts are fetched
  };

  // Function to toggle between different sections (Feed, Friends, etc.)
  const toggleSection = (section: string) => {
    setActiveSection(section); // Switch the active section
  };

  // Function to clear the search input and results
  const handleClearSearch = () => {
    setSearchTerm(""); // Clear search term
    setSearchResults([]); // Clear search results
  };

  // Function to fetch posts from Firestore
  const fetchPosts = async () => {
    try {
      const db = getFirestore(); // Get Firestore instance
      const postsRef = collection(db, "posts"); // Get reference to posts collection
      const q = query(postsRef, orderBy("timestamp", "desc")); // Query posts ordered by timestamp
      const querySnapshot = await getDocs(q); // Execute query

      const postsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to Date
      })) as Post[];

      setPosts(postsList); // Set posts state with fetched posts
    } catch (error) {
      console.error("Error fetching posts:", error); // Log any errors
    }
  };

  // Function to handle liking a post (still to be implemented)
  const handleLike = async (postId: string) => {
    // TODO: Implement like functionality
  };

  if (loading) return <ActivityIndicator size="large" color="#A0A897" />; // Show loading spinner if data is being loaded

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>

      {/* Tab navigation for different sections */}
      <View style={styles.tabContainer}>
        {/* Button to toggle between Feed, Friends, Sent Requests, and Pending Requests */}
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

      {/* Conditional rendering for active section */}
      {activeSection === "feed" && (
        <ScrollView
          style={styles.feedContainer}
          contentContainerStyle={styles.feedContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.title}>Friends Feed</Text>

          {/* Render each post */}
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

      {/* Other sections such as friends, incoming requests, and outgoing requests */}
      {/* Similar logic would follow for rendering friends, requests, etc. */}
    </View>
  );
};

// Styles for the screen
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
