import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  getDoc,
} from "firebase/firestore";

const db = getFirestore();

/** ✅ Send a Friend Request */
export const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string,
  fromUsername: string,
  fromFullName: string
) => {
  try {
    // Add request to recipient's "incoming" requests
    await setDoc(doc(db, `friendRequests/${toUserId}/incoming`, fromUserId), {
      fromUserId,
      fromUsername,
      fromFullName,
      status: "pending",
    });

    // Add request to sender's "outgoing" requests
    await setDoc(doc(db, `friendRequests/${fromUserId}/outgoing`, toUserId), {
      toUserId,
      status: "pending",
    });

    return "Friend request sent!";
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

/** ✅ Accept a Friend Request */
export const acceptFriendRequest = async (userId: string, friendId: string) => {
  try {
    // Add both users to each other's friend list
    await setDoc(doc(db, `friends/${userId}/friendList`, friendId), {
      friendId,
    });

    await setDoc(doc(db, `friends/${friendId}/friendList`, userId), {
      friendId: userId,
    });

    // Remove the friend request from Firestore
    await deleteDoc(doc(db, `friendRequests/${userId}/incoming`, friendId));
    await deleteDoc(doc(db, `friendRequests/${friendId}/outgoing`, userId));

    return "Friend request accepted!";
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
};

/** ✅ Decline a Friend Request */
export const declineFriendRequest = async (
  userId: string,
  requestId: string
) => {
  try {
    await deleteDoc(doc(db, `friendRequests/${userId}/incoming`, requestId));
    await deleteDoc(doc(db, `friendRequests/${requestId}/outgoing`, userId));
    return "Friend request declined.";
  } catch (error) {
    console.error("Error declining friend request:", error);
    throw error;
  }
};

/** ✅ Remove a Friend */
export const removeFriend = async (userId: string, friendId: string) => {
  try {
    await deleteDoc(doc(db, `friends/${userId}/friendList`, friendId));
    await deleteDoc(doc(db, `friends/${friendId}/friendList`, userId));
    return "Friend removed.";
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
};

/** ✅ Unfriend a User */
export const unfriendUser = async (userId: string, friendId: string) => {
  try {
    await deleteDoc(doc(db, `friends/${userId}/friendList`, friendId));
    await deleteDoc(doc(db, `friends/${friendId}/friendList`, userId));
    return "Friend removed.";
  } catch (error) {
    console.error("Error unfriending user:", error);
    throw error;
  }
};

/** ✅ Get List of Friends */
export const getFriendsList = async (userId: string) => {
  try {
    const friendsSnapshot = await getDocs(
      collection(db, `friends/${userId}/friendList`)
    );
    return friendsSnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching friend list:", error);
    throw error;
  }
};

/** ✅ Get Incoming Friend Requests */
export const getIncomingRequests = async (userId: string) => {
  try {
    const requestsSnapshot = await getDocs(
      collection(db, `friendRequests/${userId}/incoming`)
    );
    return requestsSnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    throw error;
  }
};

/** ✅ Get Outgoing Friend Requests */
export const getOutgoingRequests = async (userId: string) => {
  try {
    const requestsSnapshot = await getDocs(
      collection(db, `friendRequests/${userId}/outgoing`)
    );
    return requestsSnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching outgoing requests:", error);
    throw error;
  }
};

/** ✅ Search Users by Username */
export const searchUsersByUsername = async (username: string) => {
  try {
    const usersQuery = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const usersSnapshot = await getDocs(usersQuery);
    return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

/** ✅ Check if Already Friends */
export const isAlreadyFriend = async (userId: string, friendId: string) => {
  const friendDoc = await getDoc(
    doc(db, `friends/${userId}/friendList`, friendId)
  );
  return friendDoc.exists();
};

/** ✅ Check if Request Already Sent */
export const isRequestAlreadySent = async (
  fromUserId: string,
  toUserId: string
) => {
  const requestDoc = await getDoc(
    doc(db, `friendRequests/${fromUserId}/outgoing`, toUserId)
  );
  return requestDoc.exists();
};
