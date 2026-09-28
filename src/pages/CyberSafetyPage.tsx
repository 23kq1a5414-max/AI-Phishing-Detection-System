import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  KeyRound,
  Globe,
  Mail,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileQuestion,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const CyberSafetyPage: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; explanation: string } | null>(null);

  const quizQuestions = [
    {
      question: 'A website has a valid green padlock (HTTPS). Does this guarantee that the website is safe and not a phishing site?',
      options: [
        'Yes, because HTTPS certificates are only issued to verified real companies.',
        'No, attackers can easily obtain free SSL/TLS certificates for malicious spoofed domains.',
        'Yes, because HTTPS encrypts passwords so attackers cannot read them.',
        'Only if the URL ends in .org or .com.',
      ],
      correctIndex: 1,
      explanation: 'HTTPS only guarantees that traffic between your browser and the remote server is encrypted. It does NOT verify the ethical intentions or identity of the domain owner. Over 80% of modern phishing websites use valid HTTPS certificates!',
    },
    {
      question: 'A caller claiming to be from your bank security team asks you to read back a 6-digit SMS code to cancel an unauthorized charge. What should you do?',
      options: [
        'Read the code immediately to ensure the fraudulent charge is stopped.',
        'Ask the caller for their employee badge number and then give the code.',
        'Never read the code. Hang up and contact your bank using the phone number on the back of your card.',
        'Send the code via email instead.',
      ],
      correctIndex: 2,
      explanation: 'One-Time Passwords (OTPs) are authorization codes for transactions or password resets. Legitimate bank representatives will NEVER ask for your OTP over the phone or via email.',
    },
    {
      question: 'You receive an email from "IT Support" with a link: "support.company.com.verify-user.xyz". What is the true domain owner?',
      options: [
        'company.com',
        'support.company.com',
        'verify-user.xyz',
        'Both company.com and verify-user.xyz',
      ],
      correctIndex: 2,
      explanation: 'In domain naming architecture, the actual domain is the segment immediately preceding the Top-Level Domain (TLD). Here, the TLD is .xyz and the registered domain is "verify-user.xyz". Attackers insert "support.company.com" as subdomains to deceive unsuspecting targets.',
    },
  ];

  const handleSelectQuiz = (qIndex: number) => {
    setSelectedQuiz(qIndex);
    setQuizAnswer(null);
    setQuizResult(null);
  };

  const handleCheckAnswer = (optIndex: number) => {
    if (selectedQuiz === null) return;
    setQuizAnswer(optIndex);
    const q = quizQuestions[selectedQuiz];
    const isCorrect = optIndex === q.correctIndex;
    setQuizResult({
      correct: isCorrect,
      explanation: q.explanation,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          Defensive Knowledge Base
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Cyber Safety & Threat Mitigation Guide
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Comprehensive educational directives explaining social engineering tactics, deceptive domain architectures, and incident response procedures.
        </p>
      </div>

      {/* Core Educational Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why HTTPS is not enough */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            The HTTPS Myth: Why the Padlock Alone Is Not Safe
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Many users mistakenly believe that a padlock icon in the browser address bar means a site is safe. In reality, <strong className="text-amber-400">HTTPS only guarantees transport encryption</strong>, not site legitimacy. Today, threat actors routinely generate free automated certificates (via Let’s Encrypt) on phishing domains to mimic authentic SSL security.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400">
            Rule: Always verify the root domain name, not just the presence of the padlock icon.
          </div>
        </div>

        {/* The Golden Rule of OTPs */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            The Golden Rule of One-Time Passwords (OTPs)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            One-Time Passwords (OTPs) and multi-factor codes are equivalent to physical keys. Attackers use fear and psychological panic (e.g. <em>"your account is about to be suspended"</em>) to coax targets into reading back authentication codes. Legitimate service providers will <strong className="text-rose-400">NEVER ask for an OTP</strong> over phone, email, or chat.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400">
            Rule: If someone asks you for a code sent to your phone, it is a cyber attack. Period.
          </div>
        </div>

        {/* How to dissect suspicious links */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            Anatomy of a Spoofed Domain Link
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Attackers exploit subdomains to hide in plain sight. For example, in the link:
            <code className="text-cyan-400 font-mono block p-2 bg-slate-950 rounded my-1.5 break-all">
              https://chase.com.security-verify.xyz/login
            </code>
            The true domain is <strong className="text-amber-400">security-verify.xyz</strong>. The brand name <strong className="text-slate-400">chase.com</strong> is merely an arbitrary prefix string designed to deceive human eyes reading from left to right.
          </p>
        </div>

        {/* Email Red Flags Checklist */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            Top 5 Social Engineering Red Flags
          </h3>
          <ul className="text-xs text-slate-300 space-y-1.5 leading-snug">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Artificial Deadlines:</strong> Demands to act within 12 or 24 hours to create emotional urgency.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Impersonal Greetings:</strong> Generic salutations like "Dear Valued Customer" or "Dear User".</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Mismatched Sender:</strong> Header displays "PayPal Support" but the actual email domain is an unfamiliar address.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Unsolicited Attachments:</strong> Files named "Invoice.pdf.exe" or macros-enabled documents.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Incident Response Playbook */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-sm font-bold text-slate-100">
            Incident Response: What to Do If You Interacted with Suspicious Content
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-mono font-bold text-[11px] block">Step 01</span>
            <span className="font-bold text-slate-200 block">Disconnect / Terminate</span>
            <p className="text-slate-400 text-[11px] leading-snug">
              Immediately close the browser tab. Do not submit any further form inputs or click additional dialogs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-mono font-bold text-[11px] block">Step 02</span>
            <span className="font-bold text-slate-200 block">Reset Password</span>
            <p className="text-slate-400 text-[11px] leading-snug">
              From an independent verified device, navigate directly to the authentic service and change your password immediately.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-mono font-bold text-[11px] block">Step 03</span>
            <span className="font-bold text-slate-200 block">Revoke Active Sessions</span>
            <p className="text-slate-400 text-[11px] leading-snug">
              In security settings, select "Log out of all devices" to invalidate stolen session cookies and tokens.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-mono font-bold text-[11px] block">Step 04</span>
            <span className="font-bold text-slate-200 block">Report to SOC / Provider</span>
            <p className="text-slate-400 text-[11px] leading-snug">
              Forward the malicious email headers or SMS screenshot to your enterprise IT security operations center.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Phishing IQ Self-Test */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-800/50 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Interactive Defensive Aptitude Test (Quiz)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">3 Scenario Challenges</span>
        </div>

        {selectedQuiz === null ? (
          <div className="space-y-2">
            {quizQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuiz(idx)}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-700/60 transition-all flex items-center justify-between text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold text-[11px] flex items-center justify-center border border-cyan-800">
                    {idx + 1}
                  </span>
                  <span className="text-slate-300 font-medium group-hover:text-slate-100">{q.question}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                Scenario #{selectedQuiz + 1}
              </span>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-200"
              >
                Back to scenarios
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-200 leading-relaxed">
              {quizQuestions[selectedQuiz].question}
            </p>

            <div className="space-y-2">
              {quizQuestions[selectedQuiz].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleCheckAnswer(i)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    quizAnswer === i
                      ? quizResult?.correct
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-600 text-rose-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono mr-2 text-slate-500">[{String.fromCharCode(65 + i)}]</span>
                  {opt}
                </button>
              ))}
            </div>

            {quizResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed font-sans ${
                  quizResult.correct
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {quizResult.correct ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Correct Defensive Decision!
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Vulnerable Choice!
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">{quizResult.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
