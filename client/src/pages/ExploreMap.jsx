import React, { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, ZoomControl, Popup, useMap } from "react-leaflet"
import { useNavigate } from "react-router-dom"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import Navbar from "../components/Navbar"
import { useSearch } from "../context/SearchContext"
import "../styles/map.css"

const SERVICE_COLOR = "#4A1A0A"
const BORROW_COLOR = "#D4703A"

function createPinIcon(color, title) {
  return L.divIcon({
    className: "",
    html: `
      <div class="map-pin">
        <svg width="22" height="28" viewBox="0 0 22 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 17 11 17S22 18.667 22 11C22 4.925 17.075 0 11 0z" fill="${color}"/>
          <circle cx="11" cy="10" r="4" fill="white" fill-opacity="0.65"/>
        </svg>
        <div class="map-pin-label" style="background:${color}">${title}</div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [11, 28],
  })
}

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [center])
  return null
}

export default function ExploreMap() {
  const { filtered, query, setQuery, filter, setFilter } = useSearch()
  const [searchOpen, setSearchOpen] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([40.724, -73.984])
  const navigate = useNavigate()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setMapCenter([pos.coords.latitude, pos.coords.longitude])
      },
      err => console.log("Location not available")
    )
  }, [])

  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 3958.8
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)
  }

  const mapListings = filtered.filter(
    item => item.location?.lat && item.location?.lng
  )

  return (
    <div className="map-page">
      <Navbar active="explore" />
      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={17}
          className="map-container"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          <ZoomControl position="bottomright" />
          <RecenterMap center={mapCenter} />
          {mapListings.map(item => (
            <Marker
              key={item._id}
              position={[item.location.lat, item.location.lng]}
              icon={createPinIcon(
                item.type?.toLowerCase() === "service" ? SERVICE_COLOR : BORROW_COLOR,
                item.title
              )}
            >
              <Popup>
                <div style={{ minWidth: "200px", fontFamily: "Inter, Arial, sans-serif" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "600", fontSize: "14px", color: "#0B1F44" }}>{item.title}</span>
                    {userLocation && (
                   <span style={{ fontSize: "12px", color: "#6b7280" }}>
                   📍 {getDistance(userLocation.lat, userLocation.lng, item.location.lat, item.location.lng)} mi away
                  </span>
              )}
                  </div>
                  <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>
                    {item.description}
                  </p>
                  {item.availability && (
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280" }}>
                      🕐 {item.availability}
                    </p>
                  )}
                  
                  <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #eee" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{
                     width: "32px", height: "32px", borderRadius: "50%",
                      background: "#0B1F44", display: "flex", alignItems: "center",
                     justifyContent: "center", color: "white", fontSize: "12px", fontWeight: "600",
                     flexShrink: 0
                   }}>
                   {item.createdBy ? item.createdBy.toString().slice(0,2).toUpperCase() : "?"}
                  </div>
  <span style={{ fontSize: "12px", color: "#6b7280" }}>
    Posted by: <strong style={{ color: "#0B1F44" }}>{item.createdBy || "Anonymous"}</strong>
  </span>
</div>
<span style={{ fontSize: "12px", color: "#D4703A", cursor: "pointer", fontWeight: "500" }}>
  Click to view more details →
</span>
                  
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Search button / expandable input — top left */}
        <div className="map-search-overlay">
          {searchOpen ? (
            <input
              autoFocus
              className="map-search-input"
              placeholder="Search your neighborhood..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onBlur={() => { if (!query) setSearchOpen(false) }}
            />
          ) : (
            <button className="map-search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </button>
          )}
        </div>

        {/* Borrow / Service filter pills — top right */}
        <div className="map-filters">
          <button
            className={`map-filter-btn${filter === "borrow" ? " map-filter-borrow-active" : ""}`}
            onClick={() => setFilter(filter === "borrow" ? "all" : "borrow")}
          >
            Borrow
          </button>
          <button
            className={`map-filter-btn${filter === "service" ? " map-filter-service-active" : ""}`}
            onClick={() => setFilter(filter === "service" ? "all" : "service")}
          >
            Service
          </button>

          {/* View toggle */}
          <div className="view-toggle">
            <button className="view-toggle-btn" onClick={() => navigate("/list")} aria-label="List view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="9" y="3" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="15" y="3" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="3" y="9" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="9" y="9" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="15" y="9" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="3" y="15" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="9" y="15" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="15" y="15" width="4" height="4" rx="0.5" fill="currentColor"/>
              </svg>
            </button>
            <button className="view-toggle-btn view-toggle-active" aria-label="Map view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="7" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 21 Q12 21 7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 21 Q12 21 17 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="10" r="2.5" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}