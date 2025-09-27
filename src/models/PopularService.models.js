import mongoose from "mongoose";

const PopularServiceSchema = new mongoose.Schema( {
    id: number,
    title: string,
    description: string,
    img: string,
    rating: string,
    price: string,
    discountPrice: string,
})

const PopularService = mongoose.model("PopularService", PopularServiceSchema);

export default PopularService;