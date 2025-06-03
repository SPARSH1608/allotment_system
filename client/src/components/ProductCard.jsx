// ProductCard.jsx
import React from "react";

const ProductCard = ({ product }) => {
  const {
    assetId,
    model,
    brand,
    specifications,
    serialNumber,
    status,
    company,
    baseRent,
  } = product;

  const statusColors = {
    Available: "bg-gray-100 text-gray-600",
    Rented: "bg-green-100 text-green-600",
    Overdue: "bg-red-100 text-red-600",
  };

  return (
    <tr className="border-t text-sm">
      <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer">{assetId}</td>
      <td className="px-4 py-3">{model}</td>
      <td className="px-4 py-3">{brand}</td>
      <td className="px-4 py-3">
        <div>{specifications}</div>
        <div className="text-xs text-gray-500">SN: {serialNumber}</div>
      </td>
      <td className="px-4 py-3">
        <div className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[status]}`}>{status}</div>
        <div className="text-xs text-gray-500 mt-1">{company}</div>
      </td>
      <td className="px-4 py-3 font-medium">₹{baseRent.toLocaleString()}</td>
      <td className="px-4 py-3 space-x-2">
        <button className="text-blue-600 hover:underline text-sm">Edit</button>
        <button className="text-red-600 hover:underline text-sm">Delete</button>
      </td>
    </tr>
  );
};

export default ProductCard;