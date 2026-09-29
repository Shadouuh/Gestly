import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBasket, 
  Croissant, 
  Shirt, 
  Hammer, 
  Pill, 
  Utensils, 
  Store, 
  Smartphone, 
  Gamepad2, 
  Footprints, 
  BookOpen,
  Sandwich,
  Beef,
  Drumstick
} from 'lucide-react';

import ferreteriaImg from '../../../assets/images/sectors/Ferreteria.png';
import almacenKioscoImg from '../../../assets/images/sectors/AlmacenKiosco.png';
import almacenImg from '../../../assets/images/sectors/Almacen.png';
import kioscoImg from '../../../assets/images/sectors/Kiosco.png';
import carniceriaImg from '../../../assets/images/sectors/Carniceria.png';
import polleriaImg from '../../../assets/images/sectors/Polleria.png';
import gastronomiaImg from '../../../assets/images/sectors/Gastronomia.png';
import libreriaImg from '../../../assets/images/sectors/Libreria.png';
import panaderiaImg from '../../../assets/images/sectors/Panaderia.png';
import farmaciaImg from '../../../assets/images/sectors/Farmacia.png';
import jugueteriaImg from '../../../assets/images/sectors/Jugeteria.png'; // Note: Typo in filename 'Jugeteria'
import electronicaImg from '../../../assets/images/sectors/Electronica.png';
import ropaImg from '../../../assets/images/sectors/Ropa.png';
import zapateriaImg from '../../../assets/images/sectors/Zapateria.png';
import fiambreriaImg from '../../../assets/images/sectors/Fiambreria.png';

const BusinessTypes = () => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const animationRef = useRef(null);

  // Business Types Data
  const businessTypes = [
    { key: 'kiosk', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', shadow: 'hover:shadow-blue-200', image: kioscoImg },
    { key: 'grocery', icon: ShoppingBasket, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', shadow: 'hover:shadow-emerald-200', image: almacenImg },
    { key: 'bakery', icon: Croissant, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', shadow: 'hover:shadow-amber-200', image: panaderiaImg },
    { key: 'butcher', icon: Beef, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', shadow: 'hover:shadow-red-200', image: carniceriaImg },
    { key: 'poultry', icon: Drumstick, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', shadow: 'hover:shadow-orange-200', image: polleriaImg },
    { key: 'clothing', icon: Shirt, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', shadow: 'hover:shadow-pink-200', image: ropaImg },
    { key: 'hardware', icon: Hammer, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', shadow: 'hover:shadow-slate-200', image: ferreteriaImg },
    { key: 'pharmacy', icon: Pill, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', shadow: 'hover:shadow-teal-200', image: farmaciaImg },
    { key: 'restaurant', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', shadow: 'hover:shadow-orange-200', image: gastronomiaImg },
    { key: 'electronics', icon: Smartphone, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', shadow: 'hover:shadow-cyan-200', image: electronicaImg },
    { key: 'toys', icon: Gamepad2, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', shadow: 'hover:shadow-purple-200', image: jugueteriaImg },
    { key: 'shoes', icon: Footprints, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', shadow: 'hover:shadow-indigo-200', image: zapateriaImg },
    { key: 'bookstore', icon: BookOpen, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', shadow: 'hover:shadow-rose-200', image: libreriaImg },
    { key: 'deli', icon: Sandwich, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', shadow: 'hover:shadow-red-200', image: fiambreriaImg },
  ];

  // Double the items for seamless scrolling
  // We split into two rows to maintain the layout, but both rows will scroll together
  const half = Math.ceil(businessTypes.length / 2);
  const row1Items = [...businessTypes.slice(0, half), ...businessTypes.slice(0, half), ...businessTypes.slice(0, half)];
  const row2Items = [...businessTypes.slice(half), ...businessTypes.slice(half), ...businessTypes.slice(half)];

  // Auto-scroll logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const animate = () => {
      if (!isDragging) {
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 3) {
           // Reset to start (approximate, better if exact)
           // If we have 3 sets, and we reach end of 1st set (1/3 total width), we jump to 0.
           // Actually, we should jump to 0 when we reach the end of the 2nd set?
           // The safest is: when scrollLeft >= scrollWidth / 3, scrollLeft -= scrollWidth / 3.
           scrollContainer.scrollLeft -= scrollContainer.scrollWidth / 3;
        } else {
           scrollContainer.scrollLeft += 1; // Speed
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDragging]);


  // Drag functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="py-14 md:py-16 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-5 mb-10 text-center">

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[0.7rem] font-medium mb-4">
          Para todo tipo de negocio
        </div>
        <h2 className="text-[1.5rem] md:text-[1.75rem] font-display font-bold text-slate-900 mb-2 tracking-tight">
          {t('whatIsGestly.businessTypes.title')}
        </h2>
        <p className="text-[0.8rem] text-slate-500 max-w-lg mx-auto leading-relaxed">
          {t('whatIsGestly.businessTypes.subtitle')}
        </p>
      </div>

      <div 
        className="relative w-full overflow-x-hidden cursor-grab active:cursor-grabbing"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="flex flex-col gap-5 w-max px-4">
          {/* First Row */}
          <div className="flex gap-5">
            {row1Items.map((type, index) => (
              <Card key={`row1-${index}`} type={type} t={t} />
            ))}
          </div>

          {/* Second Row (Shifted visually to look staggered) */}
          <div className="flex gap-5 ml-16">
            {row2Items.map((type, index) => (
              <Card key={`row2-${index}`} type={type} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Card = ({ type, t }) => (
  <div
    className={`flex-shrink-0 group relative w-56 h-40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${type.shadow} border-2 ${type.border} bg-white`}
  >
    {/* Background Image */}
    <div className="absolute inset-0">
      <img
        src={type.image}
        alt={t(`whatIsGestly.businessTypes.types.${type.key}`)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
    </div>

    {/* Content - always visible, no height animation */}
    <div className="absolute inset-0 p-4 flex flex-col justify-end">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-xl ${type.bg} flex items-center justify-center border border-white/60 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <type.icon size={16} strokeWidth={2.5} className={type.color} />
        </div>
        <h3 className="text-base font-black text-white font-display tracking-tight drop-shadow leading-tight">
          {t(`whatIsGestly.businessTypes.types.${type.key}`)}
        </h3>
      </div>
    </div>
  </div>
);

export default BusinessTypes;
