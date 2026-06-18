import React from 'react';
import { Facebook, Twitter, Mail, MessageCircle, Link2, Check } from 'lucide-react';

interface SocialShareProps {
  roomLink: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ roomLink }) => {
  const shareText = "Join me on Sonata for some Karaoke! 🎤✨";
  
  const shares = [
    { 
      icon: <Facebook className="w-5 h-5" />, 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(roomLink)}`,
      color: "hover:bg-blue-600 hover:text-white"
    },
    { 
      icon: <Twitter className="w-5 h-5" />, 
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(roomLink)}`,
      color: "hover:bg-sky-500 hover:text-white"
    },
    { 
      icon: <MessageCircle className="w-5 h-5" />, 
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + roomLink)}`,
      color: "hover:bg-green-500 hover:text-white"
    },
    { 
      icon: <Mail className="w-5 h-5" />, 
      url: `mailto:?subject=${encodeURIComponent("Join my Sonata Karaoke Room")}&body=${encodeURIComponent(shareText + " " + roomLink)}`,
      color: "hover:bg-gray-700 hover:text-white"
    }
  ];

  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(roomLink).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          fallbackCopy();
        });
      } else {
        fallbackCopy();
      }
    } catch (e) {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = roomLink;
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Fallback copy failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Share with Friends</p>
      <div className="flex items-center gap-3">
        {shares.map((share, idx) => (
          <a
            key={idx}
            href={share.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all bg-gray-50 border border-gray-100 text-gray-400 ${share.color}`}
          >
            {share.icon}
          </a>
        ))}
        <button
          onClick={copyToClipboard}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
            copied 
              ? 'bg-[#ff0000] border-[#ff0000] text-white' 
              : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-[#ff0000] hover:text-white'
          }`}
          title={copied ? "Copied!" : "Copy Link"}
        >
          {copied ? <Check className="w-5 h-5 animate-bounce" /> : <Link2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
