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
} from "firebase/firestore"; // Importing necessary Firestore functions

const db = getFirestore(); // Getting Firestore instance

/** ✅ Send a Friend Request */
export const sendFriendRequest = async (
  fromUserId: string, // User sending the friend request
  toUserId: string, // User receiving the friend request
  fromUsername: string, // Username of the sender
  fromFullName: string // Full name of the sender
) => {
  try {
    // Add request to recipient's "incoming" friend requests
    await setDoc(doc(db, `friendRequests/${toUserId}/incoming`, fromUserId), {
      fromUserId,
      fromUsername,
      fromFullName,
      status: "pending", // Mark as pending until accepted or declined
    });

    // Add request to sender's "outgoing" friend requests
    await setDoc(doc(db, `friendRequests/${fromUserId}/outgoing`, toUserId), {
      toUserId,
      status: "pending",
    });

    return "Friend request sent!"; // Success message
  } catch (error) {
    console.error("Error sending friend request:", error); // Log any errors
    throw error; // Throw error for higher-level handling
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

    return "Friend request accepted!"; // Success message
  } catch (error) {
    console.error("Error accepting friend request:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

/** ✅ Decline a Friend Request */
export const declineFriendRequest = async (
  userId: string, // The user who declines the request
  requestId: string // The ID of the request to be declined
) => {
  try {
    // Delete the incoming request from the user's friend requests
    await deleteDoc(doc(db, `friendRequests/${userId}/incoming`, requestId));

    // Delete the outgoing request from the request sender
    await deleteDoc(doc(db, `friendRequests/${requestId}/outgoing`, userId));

    return "Friend request declined."; // Success message
  } catch (error) {
    console.error("Error declining friend request:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

/** ✅ Remove a Friend */
export const removeFriend = async (userId: string, friendId: string) => {
  try {
    // Remove the friend from both users' friend lists
    await deleteDoc(doc(db, `friends/${userId}/friendList`, friendId));
    await deleteDoc(doc(db, `friends/${friendId}/friendList`, userId));

    return "Friend removed."; // Success message
  } catch (error) {
    console.error("Error removing friend:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

/** ✅ Unfriend a User */
export const unfriendUser = async (userId: string, friendId: string) => {
  try {
        // Remove the friend from both users' friend lists
    await deleteDoc(doc(db, `friends/${userId}/friendList`, friendId));
    await deleteDoc(doc(db, `friends/${friendId}/friendList`, userId));

    return "Friend removed."; // Success message for unfriend operation
  } catch (error) {
    console.error("Error unfriending user:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

/** ✅ Get List of Friends */
export const getFriendsList = async (userId: string) => {
  try {
    // Fetch the list of friends from Firestore for the given user
    const friendsSnapshot = await getDocs(
      collection(db, `friends/${userId}/friendList`)
    );

    // Map through the snapshot and return the list of friends
    return friendsSnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching friend list:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

/** ✅ Get Incoming Friend Requests */
export const getIncomingRequests = async (userId: string) => {
  try {
    // Fetch all incoming friend requests for the given user
    const requestsSnapshot = await getDocs(
      collection(db, `friendRequests/${userId}/incoming`)
    );

    // Map through the snapshot and return the list of incoming requests
    return requestsSnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching incoming requests:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

/** ✅ Get Outgoing Friend Requests */
export const getOutgoingRequests = async (userId: string) => {
  try {
    // Fetch all outgoing friend requests for the given user
    const requestsSnapshot = await getDocs(
      collection(db, `friendRequests/${userId}/outgoing`)
    );

    // Map through the snapshot and return the list of outgoing requests
    return requestsSnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching outgoing requests:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

/** ✅ Search Users by Username */
export const searchUsersByUsername = async (username: string) => {
  try {
    // Query Firestore to find users by their username
    const usersQuery = query(
      collection(db, "users"),
      where("username", "==", username) // Search for users with the specified username
    );

    // Get the results of the query
    const usersSnapshot = await getDocs(usersQuery);

    // Return the list of users found, mapping their document ID and data
    return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error searching users:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

/** ✅ Check if Already Friends */
export const isAlreadyFriend = async (userId: string, friendId: string) => {
  try {
    // Check if the user and friend are already in each other's friend lists
    const friendDoc = await getDoc(
      doc(db, `friends/${userId}/friendList`, friendId)
    );

    // Return true if the document exists, meaning they are friends, otherwise false
    return friendDoc.exists();
  } catch (error) {
    console.error("Error checking if already friends:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

/** ✅ Check if Request Already Sent */
export const isRequestAlreadySent = async (
  fromUserId: string, // User sending the request
  toUserId: string // User receiving the request
) => {
  try {
    // Check if an outgoing request has already been sent from the sender to the recipient
    const requestDoc = await getDoc(
      doc(db, `friendRequests/${fromUserId}/outgoing`, toUserId)
    );

    // Return true if the request document exists, meaning the request was sent already, otherwise false
    return requestDoc.exists();
  } catch (error) {
    console.error("Error checking if request was already sent:", error); // Log any errors
    throw error; // Throw error for higher-level handling
  }
};

