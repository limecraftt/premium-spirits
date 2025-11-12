import React from 'react';
import { Wine, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wine className="text-amber-500" size={28} />
              <span className="text-xl font-bold">Premium Spirits</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Curating the finest spirits from around the world since 2024.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-amber-500">Whiskey</a></li>
              <li><a href="#" className="hover:text-amber-500">Vodka</a></li>
              <li><a href="#" className="hover:text-amber-500">Rum</a></li>
              <li><a href="#" className="hover:text-amber-500">Tequila</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-amber-500">About Us</a></li>
              <li><a href="#" className="hover:text-amber-500">Contact</a></li>
              <li><a href="#" className="hover:text-amber-500">Locations</a></li>
              <li><a href="#" className="hover:text-amber-500">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-amber-500">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-amber-500">Terms of Service</a></li>
              <li><a href="#" className="hover:text-amber-500">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-amber-500">Age Verification</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-400 text-sm">
            © 2024 Premium Spirits. All rights reserved. Drink Responsibly.
          </p>
          
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;