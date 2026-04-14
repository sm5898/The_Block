import React from "react";
import ListingCard from "../components/Listingcard"
import Navbar from "../components/Navbar"
import { useSearch } from "../context/SearchContext"
import "../styles/listview.css"

export default function ListView() {
 const { filtered, query, setQuery, filter, setFilter } = useSearch()

 return (
  <div>
   <Navbar active="explore" />

   <div className="lv-toolbar">
    <div className="lv-search-wrap">
     <svg className="lv-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
     </svg>
     <input
      className="lv-search-input"
      placeholder="Search listings..."
      value={query}
      onChange={e => setQuery(e.target.value)}
     />
    </div>

    <div className="lv-filters">
     <button
      className={`lv-filter-btn${filter === "borrow" ? " lv-filter-borrow-active" : ""}`}
      onClick={() => setFilter(filter === "borrow" ? "all" : "borrow")}
     >
      Borrow
     </button>
     <button
      className={`lv-filter-btn${filter === "service" ? " lv-filter-service-active" : ""}`}
      onClick={() => setFilter(filter === "service" ? "all" : "service")}
     >
      Service
     </button>
    </div>
   </div>

   <div className="grid-list">
    {filtered.map(item => (
     <ListingCard key={item._id} listing={item} />
    ))}
    {filtered.length === 0 && (
     <p className="lv-empty">No listings match your search.</p>
    )}
   </div>
  </div>
 )
}