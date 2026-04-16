import React, {useEffect,useState} from "react";
import api from "../api/api"
import ListingCard from "../components/Listingcard"
import Navbar from "../components/Navbar"

export default function ListView(){

 const [listings,setListings]=useState([])
 const [filters,setFilters]=useState({
  type:"",
  search:"",
  availability:""
 })

 useEffect(()=>{
  const fetchListings=async()=>{
   try{
    const params={}
    if(filters.type) params.type = filters.type
    if(filters.search) params.search = filters.search
    if(filters.availability) params.availability = filters.availability
    const res = await api.get("/listings", { params })
    setListings(res.data)
   }catch(err){
    console.error("Failed to fetch listings", err)
   }
  }
  fetchListings()
 },[filters])

 const updateFilter=(field, value)=>{
  setFilters(prev=>({ ...prev, [field]: value }))
 }

 const clearFilters=()=>{
  setFilters({ type:"", search:"", availability:"" })
 }

 return(
  <div>

   <Navbar active="explore"/>

   <div className="filters">
    <input
     type="text"
     placeholder="Search title or description"
     value={filters.search}
     onChange={e=>updateFilter("search", e.target.value)}
    />

    <select value={filters.type} onChange={e=>updateFilter("type", e.target.value)}>
     <option value="">All types</option>
     <option value="lend">Lend</option>
     <option value="borrow">Borrow</option>
    </select>

    <select value={filters.availability} onChange={e=>updateFilter("availability", e.target.value)}>
     <option value="">Any availability</option>
     <option value="available">Available</option>
     <option value="unavailable">Unavailable</option>
    </select>

    <button type="button" onClick={clearFilters}>
     Clear filters
    </button>
   </div>

   <div className="grid-list">
    {listings.map(item=>(
     <ListingCard
      key={item._id}
      listing={item}
     />
    ))}
   </div>

  </div>
 )

}