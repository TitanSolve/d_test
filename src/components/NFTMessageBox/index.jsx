import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

const iconMap = {
  warning: <AlertTriangle className="text-yellow-500 w-6 h-6 mr-2" />,
  error: <XCircle className="text-red-500 w-6 h-6 mr-2" />,
  success: <CheckCircle2 className="text-green-500 w-6 h-6 mr-2" />,
};

const NFTMessageBox = ({ isOpen, onClose, type, message }) => {
    return (
      <Modal open={isOpen} onClose={onClose}>
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <Box className="bg-white dark:bg-[#15191E] text-black dark:text-white rounded-xl p-6 shadow-xl w-full max-w-sm mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              {iconMap[type] || iconMap.success}
              <Typography variant="h6" className="font-semibold">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Typography>
            </div>
            <Typography variant="body1" className="text-gray-700 dark:text-gray-300 mb-4">
              {message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </Box>
        </div>
      </Modal>
    );
  };

export default NFTMessageBox;