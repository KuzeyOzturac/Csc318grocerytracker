import React from "react";
import { Camera, Upload } from "lucide-react";
import { useNavigate } from "react-router";

export const ScanReceipt = () => {
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would process the receipt
      console.log("Receipt uploaded:", file.name);
      navigate("/inventory");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Receipt</h2>
          <p className="text-gray-600">Upload your grocery receipt to automatically add items to your inventory</p>
        </div>

        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all group">
            <div className="flex flex-col items-center justify-center py-6">
              <Camera className="w-16 h-16 text-gray-400 group-hover:text-green-600 transition-colors mb-4" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-700">
                Take a photo
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
            />
          </label>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all group">
            <div className="flex flex-col items-center justify-center py-6">
              <Upload className="w-16 h-16 text-gray-400 group-hover:text-green-600 transition-colors mb-4" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-700">
                Upload from gallery
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <p className="text-xs text-gray-500 text-center">
          We'll automatically detect items and quantities from your receipt
        </p>
      </div>
    </div>
  );
};
