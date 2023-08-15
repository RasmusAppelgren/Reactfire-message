import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import Search from './Search';
import Activechats from './Activechats';
import React, { useState, useContext } from 'react';
import { collection, doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase-config"
import { AuthContext } from "../context/Auth-context"
import Chat from "./Chat";
import { ArrowLeft } from 'react-bootstrap-icons';


function Dashboard() {
    const [user, setUser] = useState('')
    const usersRef = collection(db, "users");
    const { currentUser } = useContext(AuthContext)
    const [chatStatus, setChatStatus] = useState(false)
    const [chatID, setChatID] = useState('')
    const auth = getAuth();

    function SignOut() {
        console.log("Loggar ut")
        signOut(auth)
    }
    const handleToggle = () => {
        setChatStatus((current) => !current);
    };


    const openChat = async (user) => {
        const chatID = currentUser.uid < user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid
        setChatID(chatID)
        setUser(user)
        const res = await getDoc(doc(db, "chats", chatID));
        if (!res.exists()) {
            console.log("Create new chat and userChats")
            await setDoc(doc(db, "chats", chatID), { messages: [] });
            await updateDoc(doc(db, "userChats", currentUser.uid), {
                chat: arrayUnion({
                    chatId: chatID,
                    member: user.displayName
                })
            })
            await updateDoc(doc(db, "userChats", user.uid), {
                chat: arrayUnion({
                    chatId: chatID,
                    member: currentUser.displayName
                })
            })
            setChatStatus(true)
        } else {
            setChatStatus(true)

        }
    }
    const openActiveChat = async (id) => {
        setChatID(id)
        setChatStatus(true)
    }
    console.log(user.uid)

    if (chatStatus) {
        return (
            <>
                <nav className="navbar bg-body-tertiary sticky-top">
                    <div className="container-fluid">
                        <i onClick={handleToggle}>
                            <ArrowLeft color="royalblue" size={30} />
                        </i>
                        <p>{user.displayName}</p>
                        <span className="navbar-brand mb-0 h1">Chat</span>
                    </div>
                </nav>
                <div className="">
                    <Chat chatID={chatID} />
                </div>
            </>
        )

    } else {
        return (
            <>
                <nav className="navbar bg-body-tertiary sticky-top">
                    <div className="container-fluid">
                        <span className="navbar-brand mb-0 h1">Dashboard</span>
                        <button onClick={SignOut} className="btn btn-outline-dark btn-sm">Logga ut</button>
                    </div>
                </nav>
                <div className="container">
                    <Search openChat={openChat} />
                    <Activechats openActiveChat={openActiveChat} />
                </div>
                <footer id="sticky-footer" className="flex-shrink-0 py-4 bg-dark text-white-50">
                    <div className="container text-center">
                        <small>React Firebase chat</small>
                    </div>
                </footer>
            </>
        )
    }


}

export default Dashboard;
