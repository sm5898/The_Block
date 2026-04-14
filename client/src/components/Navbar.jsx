import React from "react";
import { useNavigate } from "react-router-dom"
import "../styles/navbar.css"

export default function Navbar({active}){
 const navigate = useNavigate()

 return(
  <div className="navbar">
   <div className="logo">
    <div/>
    <div/>
    <div/>
    <div/>
   </div>

   <div className="nav-pill">
    <span className={active==="explore"?"active":""} onClick={() => navigate("/explore")}>Explore</span>
    <span className={active==="messages"?"active":""} onClick={() => navigate("/messages")}>Messages</span>
    <span className={active==="post"?"active":""} onClick={() => navigate("/create")}>Post</span>
   </div>

   <div className="avatar">AS</div>
  </div>
 )
}