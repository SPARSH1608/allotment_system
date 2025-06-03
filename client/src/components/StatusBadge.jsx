import React from 'react'
const StatusBadge = ({ status }) => {
    const colors = {
      Rented: "bg-green-100 text-green-700",
      Available: "bg-gray-100 text-gray-800",
      Overdue: "bg-red-100 text-red-700"
    };
  
    return (
      <span className={`text-xs px-2 py-1 rounded ${colors[status]}`}>
        {status}
      </span>
    );
  };
  
  export default StatusBadge;
  