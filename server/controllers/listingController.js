import Listing from "../models/Listing.js"

export const getListings=async(req,res)=>{

 const { type, search, availability } = req.query
 const filter = {}

 if(type) filter.type = type
 if(availability) filter.availability = availability
 if(search) {
  filter.$or = [
   { title: new RegExp(search, "i") },
   { description: new RegExp(search, "i") }
  ]
 }

 const listings = await Listing.find(filter)
 res.json(listings)

}

export const createListing = async (req, res) => {

 const listing=new Listing(req.body)

 await listing.save()

 res.json(listing)

}