import React from "react";
import { useState } from "react"
import api from "../api/api"
import Navbar from "../components/Navbar"

export default function CreatePost() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "borrow",
    image: "",
    location: {
      lat: "",
      lng: ""
    }
  })

  const submit = async () => {
    await api.post("/listings", form)
    alert("Listing created!")
  }

  return (
    <div>
      <Navbar active="post" />
      <div className="form-grid">
        <div>
          <input
            className="input"
            placeholder="Title"
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="input"
            placeholder="Description"
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="input"
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <option value="borrow">Borrow</option>
            <option value="service">Service</option>
          </select>
          <input
            className="input"
            placeholder="Image URL"
            onChange={e => setForm({ ...form, image: e.target.value })}
          />
          <input
            className="input"
            placeholder="Latitude (e.g. 40.7128)"
            onChange={e => setForm({ ...form, location: { ...form.location, lat: parseFloat(e.target.value) } })}
          />
          <input
            className="input"
            placeholder="Longitude (e.g. -74.0060)"
            onChange={e => setForm({ ...form, location: { ...form.location, lng: parseFloat(e.target.value) } })}
          />
          <button onClick={submit}>
            Create Listing
          </button>
        </div>
        <div className="preview" />
      </div>
    </div>
  )
}