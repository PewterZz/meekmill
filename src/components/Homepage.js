import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { uid } from "uid";
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { set, ref, onValue, remove, update } from "firebase/database";
import "./homepage.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckIcon from "@mui/icons-material/Check";

export default function Homepage() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUidd, setTempUidd] = useState("");
  const [filterCompleted, setFilterCompleted] = useState(false); // new state for filter
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      writeToDatabase();
    }
  };

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
      completed: false, // default to false
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
    console.log(uidd);
    const todoRef = doc(db, "todos", uidd);
    deleteDoc(todoRef);
  };

  // complete
  const handleComplete = (uidd) => {
    const todoRef = doc(db, "todos", uidd);
    updateDoc(todoRef, {
      completed: true,
    });
  };

  // filter
  const filteredTodos = filterCompleted
    ? todos.filter((todo) => todo.completed)
    : todos;

  return (
    <div className="homepage">
      <div>
        <h1>Todo App</h1>
        <div className="logout-icon">
          <LogoutIcon onClick={handleSignOut} />
        </div>
        <div className="add-todo">
          <input
            type="text"
            placeholder="Add todo"
            value={todo}
            className="todo-input"
            onChange={(event) => setTodo(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          {isEdit ? (
            <CheckIcon onClick={handleEditConfirm} />
          ) : (
            <AddIcon onClick={writeToDatabase} />
          )}
        </div>
        <div className="filter-todos">
          <label htmlFor="filter-completed">Filter Completed</label>
          <input
            type="checkbox"
            id="filter-completed"
            checked={filterCompleted}
            onChange={() => setFilterCompleted(!filterCompleted)}
          />

        </div>
        <ul>
          {filteredTodos.map((todo) => (
            <li key={uid()}>
              <div className="todos">
                <p className={todo.completed ? "completed" : ""}>
                  {todo.todo}
                </p>
              </div>
              <div className="todo-actions">
                <EditIcon onClick={() => handleUpdate(todo)} />
                <DeleteIcon onClick={() => handleDelete(todo.id)} />
                {!todo.completed && (
                  <CheckIcon onClick={() => handleComplete(todo.id)} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}