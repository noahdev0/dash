"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, RefreshCw, Truck } from 'lucide-react';

interface ShelfData {
  id: string;
  tag: string;
  name: string;
  packages: {
    level1: number;
    level2: number;
  };
  deliveredToday: number;
  status: 'available' | 'full' | 'maintenance';
}

export function ShelfTracker() {
  // Mock initial shelf data
  const initialShelfData: ShelfData[] = [
    { id: '001', tag: 'A1', name: 'Storage Alpha', packages: { level1: 12, level2: 8 }, deliveredToday: 3, status: 'available' },
    { id: '002', tag: 'B2', name: 'Storage Beta', packages: { level1: 15, level2: 15 }, deliveredToday: 7, status: 'full' },
    { id: '003', tag: 'C3', name: 'Storage Gamma', packages: { level1: 5, level2: 10 }, deliveredToday: 2, status: 'available' },
    { id: '004', tag: 'D4', name: 'Storage Delta', packages: { level1: 0, level2: 3 }, deliveredToday: 0, status: 'maintenance' },
    { id: '005', tag: 'E5', name: 'Storage Epsilon', packages: { level1: 10, level2: 7 }, deliveredToday: 5, status: 'available' },
  ];

  const [shelves, setShelves] = useState<ShelfData[]>(initialShelfData);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  // Function to simulate new package delivery
  const simulateDelivery = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setShelves(prevShelves => 
        prevShelves.map(shelf => {
          // Only add packages to available shelves
          if (shelf.status === 'available') {
            const level = Math.random() > 0.5 ? 'level1' : 'level2';
            const newPackages = { ...shelf.packages };
            newPackages[level] += 1;
            
            // Check if shelf is now full
            const totalPackages = newPackages.level1 + newPackages.level2;
            const newStatus = totalPackages >= 30 ? 'full' : 'available';
            
            return {
              ...shelf,
              packages: newPackages,
              deliveredToday: shelf.deliveredToday + 1,
              status: newStatus
            };
          }
          return shelf;
        })
      );
      setIsLoading(false);
    }, 800);
  };

  // Function to sort shelves
  const sortShelves = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    setShelves(prevShelves => {
      return [...prevShelves].sort((a, b) => {
        // Handle nested properties like packages.level1
        if (key.includes('.')) {
          const [parentKey, childKey] = key.split('.');
          if (direction === 'ascending') {
            return a[parentKey][childKey] - b[parentKey][childKey];
          } else {
            return b[parentKey][childKey] - a[parentKey][childKey];
          }
        }
        
        // Handle direct properties
        if (direction === 'ascending') {
          return a[key] > b[key] ? 1 : -1;
        } else {
          return a[key] < b[key] ? 1 : -1;
        }
      });
    });
  };

  return (
    <motion.div
      className="bg-[#1A1A1A]/60 backdrop-blur-md border border-gray-800 rounded-lg p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Package Delivery Tracker</h2>
        <div className="flex gap-2">
          <motion.button
            onClick={simulateDelivery}
            disabled={isLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-500/30 text-blue-200 text-sm hover:bg-blue-500/50 transition-colors`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Truck size={14} />
            )}
            <span>Simulate Delivery</span>
          </motion.button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5">
        <div className="inline-block min-w-full align-middle p-5">
          <div className="overflow-hidden rounded-lg border border-gray-700/50">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-black/20">
                <tr>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/20"
                    onClick={() => sortShelves('tag')}
                  >
                    Shelf Tag
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/20"
                    onClick={() => sortShelves('name')}
                  >
                    Shelf Name
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/20"
                    onClick={() => sortShelves('packages.level1')}
                  >
                    Level 1 Packages
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/20"
                    onClick={() => sortShelves('packages.level2')}
                  >
                    Level 2 Packages
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/20"
                    onClick={() => sortShelves('deliveredToday')}
                  >
                    Delivered Today
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/20"
                    onClick={() => sortShelves('status')}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50 bg-black/10">
                {shelves.map((shelf, index) => (
                  <motion.tr 
                    key={shelf.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white/90">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-7 w-7 rounded-md bg-indigo-500/20 text-indigo-300">
                          {shelf.tag}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {shelf.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package size={14} className="text-blue-400 mr-2" />
                        <span className="text-sm text-gray-300">{shelf.packages.level1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package size={14} className="text-purple-400 mr-2" />
                        <span className="text-sm text-gray-300">{shelf.packages.level2}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {shelf.deliveredToday}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${shelf.status === 'available' ? 'bg-green-500/20 text-green-300' : 
                          shelf.status === 'full' ? 'bg-yellow-500/20 text-yellow-300' : 
                          'bg-red-500/20 text-red-300'}`
                      }>
                        {shelf.status.charAt(0).toUpperCase() + shelf.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Showing {shelves.length} shelves
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500/30 rounded-full"></span>
            <span className="text-xs text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500/30 rounded-full"></span>
            <span className="text-xs text-gray-400">Full</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500/30 rounded-full"></span>
            <span className="text-xs text-gray-400">Maintenance</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 