import React from 'react';
import { 
  Utensils, 
  Plane, 
  Laptop, 
  Building, 
  Sparkles, 
  FileText, 
  Coffee, 
  HelpCircle,
  Tag
} from 'lucide-react';

const categoryStyles = {
  Food: { bg: '#FEF3C7', color: '#92400E', icon: Utensils },
  Meals: { bg: '#FEF3C7', color: '#92400E', icon: Utensils },
  Travel: { bg: '#DBEAFE', color: '#1E40AF', icon: Plane },
  Flight: { bg: '#DBEAFE', color: '#1E40AF', icon: Plane },
  Hotel: { bg: '#E0E7FF', color: '#3730A3', icon: Building },
  Accommodation: { bg: '#E0E7FF', color: '#3730A3', icon: Building },
  Tech: { bg: '#EDE9FE', color: '#5B21B6', icon: Laptop },
  Software: { bg: '#EDE9FE', color: '#5B21B6', icon: Laptop },
  Office: { bg: '#F1F5F9', color: '#334155', icon: FileText },
  Supplies: { bg: '#F1F5F9', color: '#334155', icon: FileText },
  Entertainment: { bg: '#FCE7F3', color: '#9D174D', icon: Sparkles },
  Coffee: { bg: '#FFEDD5', color: '#9A3412', icon: Coffee },
};

export default function Badge({ category }) {
  if (!category) return null;
  const style = categoryStyles[category] || {
    bg: '#F3F4F6',
    color: '#4B5563',
    icon: Tag,
  };

  const Icon = style.icon;

  return (
    <span
      className="badge"
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.color}20`,
      }}
    >
      <Icon size={12} />
      <span>{category}</span>
    </span>
  );
}
