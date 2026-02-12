import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { Sun, Lock } from 'lucide-react';

interface FooterProps {
    onAdminClick?: () => void; // Legacy support
}

const Footer: React.FC<FooterProps> = () => {
  const { goToAdmin } = useNavigation();

  return (
    <footer className="bg-[#222] text-gray-400 text-xs py-4 border-t border-gray-800 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-2 md:mb-0">
                <a href="#" className="hover:text-white">Datenschutzerklärung</a>
                <span>|</span>
                <a href="#" className="hover:text-white">AGB</a>
                <span>|</span>
                <a href="#" className="hover:text-white">Impressum</a>
            </div>
            <div className="flex items-center space-x-3">
                <button 
                    onClick={goToAdmin}
                    className="text-gray-600 hover:text-f1-pink transition-colors p-1"
                    title="Admin Login"
                >
                    <Lock size={12} />
                </button>
                <div className="bg-pink-100 text-f1-pink p-1 rounded-full cursor-pointer hover:bg-pink-200">
                    <Sun size={14} />
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;