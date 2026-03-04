import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Heart } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full mt-auto pt-16">
            {/* Main Footer Content */}
            <div className="bg-gradient-to-br from-brand-green-dark via-brand-green-main to-emerald-700 text-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Logo and Title Section */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <img
                            src="/images/logo.webp"
                            alt="Logo MI Al-Ghazali"
                            className="w-14 h-14 object-contain bg-white rounded-full p-1 shadow-lg"
                        />
                        <div className="text-center">
                            <h2 className="text-xl font-black tracking-tight">MI AL-GHAZALI</h2>
                            <p className="text-xs text-emerald-200 font-medium">Rombasan Pragaan Sumenep</p>
                        </div>
                    </div>

                    {/* Contact Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Address */}
                        <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                            <div className="w-10 h-10 bg-brand-orange-main rounded-lg flex items-center justify-center shrink-0 shadow-md">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">Alamat</p>
                                <p className="text-sm font-medium leading-relaxed">Rombasan, Pragaan, Sumenep</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                            <div className="w-10 h-10 bg-brand-orange-main rounded-lg flex items-center justify-center shrink-0 shadow-md">
                                <Phone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">Telepon</p>
                                <p className="text-sm font-medium">+62 823-3111-6111</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                            <div className="w-10 h-10 bg-brand-orange-main rounded-lg flex items-center justify-center shrink-0 shadow-md">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-sm font-medium break-all">mialove.kami@gmail.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm">
                        <Link to="/" className="hover:text-brand-orange-main transition-colors font-medium">Beranda</Link>
                        <span className="text-emerald-400">•</span>
                        <Link to="/profil-madrasah" className="hover:text-brand-orange-main transition-colors font-medium">Profil</Link>
                        <span className="text-emerald-400">•</span>
                        <Link to="/kesiswaan" className="hover:text-brand-orange-main transition-colors font-medium">Kesiswaan</Link>
                        <span className="text-emerald-400">•</span>
                        <Link to="/sarpras" className="hover:text-brand-orange-main transition-colors font-medium">Sarpras</Link>
                        <span className="text-emerald-400">•</span>
                        <Link to="/pmb" className="hover:text-brand-orange-main transition-colors font-medium">PMB</Link>
                    </div>

                    {/* Social Media */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <a
                            href="#"
                            className="w-10 h-10 bg-white/10 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                            aria-label="Facebook"
                        >
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                            aria-label="Instagram"
                        >
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 bg-white/10 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                            aria-label="YouTube"
                        >
                            <Youtube className="w-5 h-5" />
                        </a>
                    </div>

                    <hr className="border-white/20 mb-4" />

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="text-xs text-emerald-200 flex items-center justify-center gap-1.5 flex-wrap">
                            <span>© {currentYear} MI Al-Ghazali.</span>
                            <span>Dibuat dengan</span>
                            <Heart className="w-3 h-3 text-red-400 fill-red-400 inline" />
                            <span>untuk pendidikan berkualitas.</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

