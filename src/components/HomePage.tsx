import React, { useState } from 'react';
import { WebsiteCustomization, SchoolNews, ScratchCard, ExamResult, Student } from '../types/school';
import { ModernHeroSlider } from './ModernHeroSlider';
import { SchoolBadge } from './SchoolBadge';
import { SchoolNewsCard, SchoolNewsDetailModal } from './NewsCardAndModal';
import { PostSchoolNewsForm } from './PostSchoolNewsForm';
import {
  Sparkles,
  MapPin,
  Award,
  BookOpen,
  Cpu,
  Zap,
  Wrench,
  GraduationCap,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Layers,
  Search,
  KeyRound,
  Newspaper,
  Plus,
  X
} from 'lucide-react';

interface HomePageProps {
  customization: WebsiteCustomization | null;
  news: SchoolNews[];
  scratchCards?: ScratchCard[];
  students?: Student[];
  results?: ExamResult[];
  onOpenLogin: () => void;
  onNavigateToCheckResult: () => void;
  onPostNews?: (data: Omit<SchoolNews, 'id' | 'publishedAt'>) => Promise<SchoolNews>;
  onUpdateNews?: (id: string, updates: Partial<SchoolNews>) => Promise<void>;
  canManageNews?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  customization,
  news,
  scratchCards = [],
  students = [],
  results = [],
  onOpenLogin,
  onNavigateToCheckResult,
  onPostNews,
  onUpdateNews,
  canManageNews = false
}) => {
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<SchoolNews | null>(null);
  const [showPostNewsSpace, setShowPostNewsSpace] = useState(false);

  const categories = ['All', 'Admissions', 'Examination', 'Technical Workshop', 'Sports & Culture', 'General'];

  const filteredNews =
    selectedNewsCategory === 'All'
      ? news
      : news.filter((n) => n.category === selectedNewsCategory);

  const schoolEmail =
    customization?.schoolContactEmail && !/gstc|garki/i.test(customization.schoolContactEmail)
      ? customization.schoolContactEmail
      : 'admissions@ustcmakurdi.edu.ng';
  const schoolPhone = customization?.schoolPhone || '+234 803 712 4500';
  const schoolAddress =
    customization?.schoolAddress && !/garki|abuja/i.test(customization.schoolAddress)
      ? customization.schoolAddress
      : 'Walmayo, Kanshio / Km 1 Gboko Road, Rev. Fr. Moses Orshio Adasu University Campus, Makurdi, Benue State, Nigeria';
  const bannerNoticeText =
    customization?.bannerNoticeText ||
    'Official Notice: Terminal examination continuous assessment marks are compiled and available through student portal scratch cards.';
  const showBanner = customization?.bannerNoticeActive ?? true;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Super part of the homepage: sliding pictures down every 5 seconds & login button below */}
      <section>
        <ModernHeroSlider
          onOpenLogin={onOpenLogin}
          onNavigateToCheckResult={onNavigateToCheckResult}
          onExplorePrograms={() => {
            const el = document.getElementById('trades-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </section>

      {/* 2. Primary Writeup: Sourced Profile & History of the Science and Technical College, Makurdi */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Subtle decorative crest background */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <SchoolBadge size="lg" className="shadow-md" />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Est. GTTS / BSU 1992 Heritage • NBTE &amp; NABTEB Accredited • Makurdi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-stone-900 tracking-tight leading-tight">
                Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi — Benue State&apos;s Premier TVET &amp; STEM Institution.
              </h2>
            </div>
          </div>

          <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="font-medium text-stone-800 text-base sm:text-lg">
              Strategically situated along the <strong>Walmayo, Kanshio and Km 1 Gboko Road axis of Makurdi, Benue State</strong>, <strong>Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi</strong> (historically the <strong>Government Technical Training School / Government Technical College, Makurdi</strong> and <strong>Benue State University Technical College</strong>) stands as Benue State&apos;s flagship center for Technical and Vocational Education and Training (TVET) and scientific inquiry.
            </p>
            <p>
              When the Benue State Government under <strong>Executive Governor Rev. Fr. Moses Orshio Adasu</strong> founded <strong>Benue State University (officially renamed Rev. Fr. Moses Orshio Adasu University, Makurdi — MOAUM in 2025)</strong> in <strong>1992</strong>, the university campus embraced the historic premises of the <strong>Government Technical Training School (GTTS), Makurdi</strong> alongside the pioneer <strong>Department of Vocational and Technical Education</strong> (established in the 1992/1993 academic session and granted full degree-awarding accreditation in June 1997).
            </p>
            <p>
              Guided by the motto <em>&ldquo;Scientia Liberatio Populorum&rdquo;</em> (Knowledge for the Liberation of the People) and fully registered and accredited by both the <strong>National Board for Technical Education (NBTE)</strong> and the <strong>National Business and Technical Examinations Board (NABTEB)</strong>, the college trains students for the <strong>National Technical Certificate (NTC)</strong>, <strong>National Business Certificate (NBC)</strong>, <strong>WAEC</strong>, and <strong>NECO</strong> examinations. Following recent campus classroom rehabilitations, workshop upgrades, and the installation of solar-powered street lighting across the Makurdi campus, students train directly with automotive diagnostic rigs, agricultural mechanization tools, solar PV arrays, lathe machines, and ICT/robotics workstations.
            </p>
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-stone-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b4d2c]">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Institutional Leadership, NBTE Mandate &amp; MOAUM Academic Synergy</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-stone-700">
                Led by our Principal, <strong>Very Rev. Fr. Dr. Terngu Orshio</strong>, and supported by seasoned engineers, trade instructors, and technical educators in collaboration with the <strong>MOAUM Department of Vocational &amp; Technical Education</strong>, the college bridges the industrial skill gap in Benue State (&ldquo;The Food Basket of the Nation&rdquo;) by producing self-reliant technicians, agro-mechanical innovators, and future engineering undergraduates.
              </p>
            </div>
          </div>

          {/* Core Highlights Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-200">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#0b4d2c] block">
                1992
              </span>
              <span className="text-[11px] text-stone-600 font-semibold uppercase mt-1 block">
                GTTS / MOAUM Heritage
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 block">
                10
              </span>
              <span className="text-[11px] text-stone-600 font-semibold uppercase mt-1 block">
                NBTE/NABTEB Trades
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-blue-600 block">
                NTC/NBC
              </span>
              <span className="text-[11px] text-stone-600 font-semibold uppercase mt-1 block">
                &amp; WAEC/NECO Certified
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 block">
                NBTE
              </span>
              <span className="text-[11px] text-stone-600 font-semibold uppercase mt-1 block">
                &amp; NABTEB Accredited
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Technical Trades & Vocational Departments Showcase */}
      <section id="trades-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-stone-200">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
              Approved NBTE, NABTEB &amp; MOAUM Technical Curriculum • Makurdi
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
              10 Accredited Technical Crafts &amp; Vocational Trade Departments
            </h2>
          </div>
          <p className="text-xs text-stone-500 max-w-sm">
            Hands-on National Technical Certificate (NTC) and NBC workshops at the Walmayo-Kanshio &amp; Gboko Road Campus, Makurdi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-emerald-600">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">1. Computer Craft Studies &amp; GSM Maintenance</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Computer hardware &amp; GSM repair and maintenance, networking protocols, Python/Scratch programming, web development, and robotics integration.
            </p>
            <span className="text-[11px] font-semibold text-emerald-700 block">
              Department Code: CST101 • ICT &amp; Microcomputing Lab
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-amber-500">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">2. Electrical Installation &amp; Solar PV Works</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Domestic and industrial conduit wiring, power distribution, solar photovoltaic (PV) inverter installation and maintenance, and electric motor winding.
            </p>
            <span className="text-[11px] font-semibold text-amber-700 block">
              Department Code: EIM102 • Electrical &amp; Solar PV Workshop
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-red-600">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">3. Automobile Mechanics &amp; Auto-Electrical</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Motor vehicle mechanics work, internal combustion engine overhaul, auto-electrical wiring, autobody repair, and modern OBD vehicle diagnostics.
            </p>
            <span className="text-[11px] font-semibold text-red-700 block">
              Department Code: AMT103 • Automobile Engineering Bay
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-purple-600">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">4. Building Construction, Bricklaying &amp; Concreting</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Bricklaying, block-laying and concreting (BBC), architectural drafting technology, structural masonry, plumbing &amp; pipe fitting, and site surveying.
            </p>
            <span className="text-[11px] font-semibold text-purple-700 block">
              Department Code: BCT104 • Building &amp; Civil Yard
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-blue-600">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">5. Welding, Fabrication &amp; Metal Work Tech</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Mechanical production technology, oxy-acetylene, electric arc and MIG/TIG welding, structural steel fabrication, and precision centre-lathe machining.
            </p>
            <span className="text-[11px] font-semibold text-blue-700 block">
              Department Code: WFT105 • Metal Work &amp; Fabrication Bay
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-cyan-600">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">6. Refrigeration &amp; Air-Conditioning (RAC)</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Domestic and commercial refrigeration, HVAC installation, cold-room storage maintenance for agricultural produce, and compressor troubleshooting.
            </p>
            <span className="text-[11px] font-semibold text-cyan-700 block">
              Department Code: RAC106 • Thermal &amp; HVAC Workshop
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-teal-600">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">7. Woodworking, Carpentry &amp; Joinery Craft</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Industrial woodworking machinery operation, roof truss framing, bespoke furniture making, cabinetry, and interior timber finishing.
            </p>
            <span className="text-[11px] font-semibold text-teal-700 block">
              Department Code: WWT107 • Woodwork &amp; Joinery Mill
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-lime-600">
            <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">8. Agricultural Mechanics &amp; Smart Mechanisation</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tractor and farm implement maintenance, post-harvest agro-processing machinery fabrication, and smart irrigation systems tailored for Benue agriculture.
            </p>
            <span className="text-[11px] font-semibold text-lime-700 block">
              Department Code: AGM108 • Benue Agro-Mechanics Yard
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-indigo-600">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">9. Electronics, Radio/TV &amp; Communication Tech</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Printed circuit board (PCB) assembly, telecommunication electronics, solid-state signal diagnostics, and digital satellite/TV servicing.
            </p>
            <span className="text-[11px] font-semibold text-indigo-700 block">
              Department Code: ECT109 • Electronics &amp; Comms Lab
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-pink-600 sm:col-span-2 lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    10. Garment Making, Fashion Design &amp; Catering Craft Practice
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mt-1">
                    Pattern drafting, industrial sewing &amp; textile production alongside commercial culinary arts, nutrition science, hospitality management, and food hygiene for National Business &amp; Technical Certificate (NBC/NTC) candidates.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-pink-700 shrink-0 bg-pink-50 px-3 py-1.5 rounded-lg border border-pink-200">
                Department Code: GMC110 • Apparel &amp; Hospitality Suite
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. School News & Public Dispatches (Posted by Admins for Visitors) */}
      <section id="landing-school-news" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#0b4d2c]" />
              <h2 className="text-2xl font-bold font-serif text-stone-900">
                School News &amp; Administrative Announcements
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified school news, photo galleries, video highlights, admission notices, and events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Post School News button for admins (or if onPostNews is provided) */}
            {canManageNews && onPostNews && (
              <button
                type="button"
                onClick={() => setShowPostNewsSpace((prev) => !prev)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {showPostNewsSpace ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Close News Editor</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post School News</span>
                  </>
                )}
              </button>
            )}

            {/* Category Filter Controls */}
            <div className="flex flex-wrap gap-1 p-1 bg-stone-100 rounded-lg">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedNewsCategory(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    selectedNewsCategory === cat
                      ? 'bg-[#0b4d2c] text-white shadow-xs font-semibold'
                      : 'hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Post School News Composer Space */}
        {showPostNewsSpace && onPostNews && (
          <div className="animate-in fade-in duration-200">
            <PostSchoolNewsForm
              onPostNews={onPostNews}
              onUpdateNews={onUpdateNews}
            />
          </div>
        )}

        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-stone-700">No news articles in this category</p>
            <p className="text-xs text-stone-400 mt-1">
              Select another filter or check back as administrative dispatches are posted in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNews.map((item) => (
              <SchoolNewsCard
                key={item.id}
                item={item}
                onSelect={(article) => setActiveArticle(article)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. Campus Location in Makurdi, Benue State & Principal Welcome */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Principal&apos;s Official Address &amp; Executive Leadership</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            Inspiring Scientific &amp; Technical Excellence in Makurdi
          </h3>
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic border-l-2 border-emerald-600 pl-4">
            "{customization?.principalWelcomeMessage && !/garki|gstc/i.test(customization.principalWelcomeMessage)
              ? customization.principalWelcomeMessage
              : 'Welcome to Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi. Guided by our motto Scientia Liberatio Populorum, and working alongside our dedicated team of high-performing administrative and academic staff, we are committed to scientific excellence, technological innovation, and vocational mastery across all 9 NABTEB-accredited trades.'}"
          </p>
          <p className="text-stone-600 text-xs leading-relaxed">
            Under the visionary and result-oriented leadership of <strong>Very Rev. Fr. Dr. Terngu Orshio</strong>, and backed by a dedicated team of top-performing administrative officers, master craftsmen, and academic instructors, Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi continues to set the pace in science, robotics, and technical education in Nigeria.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <SchoolBadge size="sm" />
            <div>
              <p className="text-xs font-bold text-stone-900">Very Rev. Fr. Dr. Terngu Orshio</p>
              <p className="text-[11px] text-stone-500">
                Principal &amp; Chief Executive • Rev. Fr. Moses Orshio Adasu University Science and Technical College, Makurdi
              </p>
            </div>
          </div>
        </div>

        {/* Location & Quick Contact */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Campus Location</span>
            </div>
            <h4 className="font-bold text-stone-900 text-sm">
              Makurdi, Benue State
            </h4>
            <p className="text-xs text-stone-600 mt-1">
              {schoolAddress}
            </p>
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-stone-200">
            <div className="flex items-center gap-2 text-stone-700">
              <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{schoolPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{schoolEmail}</span>
            </div>
          </div>

          <button
            onClick={onOpenLogin}
            className="w-full py-2.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Staff & Student Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Article Detail Modal with Images & Videos */}
      <SchoolNewsDetailModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />
    </div>
  );
};
