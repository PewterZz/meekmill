import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { collection, doc, addDoc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { set, ref, onValue, remove, update } from "firebase/database";
import "./Homepage.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from '@mui/icons-material/Logout';
import CheckIcon from '@mui/icons-material/Check';

export default function Homepage() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUidd, setTempUidd] = useState("");
  const navigate = useNavigate();
  const collectionRef = collection(db, "todos");


  useEffect(() => {
    const collectionRef = collection(db, "todos");
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      const updatedTodos = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        updatedTodos.push({ id: doc.id, ...data });
      });
      setTodos(updatedTodos);
    });
    return unsubscribe;
  }, []);
  

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  // add
  const writeToDatabase = () => {
    addDoc(collectionRef, {
      todo: todo,
    })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        setTodo("");
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };
  

  // update
  const handleUpdate = (todo) => {
    setIsEdit(true);
    setTodo(todo.todo);
    setTempUidd(todo.id);
  };
  
  const handleEditConfirm = () => {
    const todoRef = doc(db, "todos", tempUidd);
    updateDoc(todoRef, {
      todo: todo,
    });
    setTodo("");
    setIsEdit(false);
  };

  // delete
  const handleDelete = (uidd) => {
    console.log(uidd)
    const todoRef = doc(db, "todos", uidd);
    deleteDoc(todoRef);
  };
  


  return (
    <div className="homepage">
      <div>
        <h1 >Todo App</h1>
        <LogoutIcon className="logout-icon" onClick={handleSignOut} />
      </div>
      <div>
        <div>
          <input
            type="text"
            placeholder="Enter your todo"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
          />
          {isEdit ? (
            <CheckIcon onClick={handleEditConfirm} />
          ) : (
            <AddIcon onClick={writeToDatabase} />
          )}
        </div>
        <div className="todo">
          {todos.map((todo) => (
            <div className="homepage__body__todos__todo" key={todo.id}>
              <p>{todo.todo}</p>
              <div className="homepage__body__todos__todo__icons">
                <EditIcon className="edit-button" onClick={() => handleUpdate(todo)} />
                <DeleteIcon className="delete-button" onClick={() => handleDelete(todo.id)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
}
