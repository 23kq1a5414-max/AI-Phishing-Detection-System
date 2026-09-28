import React, { useEffect, useState } from 'react';
import { ModelPerformanceData, ModelMetric } from '../types/index.js';
import { getModelPerformance, retrainModels } from '../services/api.js';
import {
  Cpu,
  CheckCircle2,
  RefreshCw,
  BarChart2,
  GitBranch,
  Layers,
  Database,
  ArrowRight,
  Shield,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const ModelPerformancePage: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>('Random Forest Classifier');

  useEffect(() => {
    async function loadData() {
      try {
        const perf = await getModelPerformance();
        setData(perf);
      } catch (err) {
        console.error('Failed to load model performance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainSuccess(null);
    try {
      const res = await retrainModels();
      setRetrainSuccess(`${res.message} ${res.bestModel}`);
      const updated = await getModelPerformance();
      setData(updated);
      setTimeout(() => setRetrainSuccess(null), 5000);
    } catch (err) {
      console.error('Retrain error:', err);
    } finally {
      setRetraining(false);
    }
  };

  const chartData = data?.models.map((m) => ({
    name: m.name.replace(' Classifier', ''),
    Accuracy: Number((m.accuracy * 100).toFixed(1)),
    Precision: Number((m.precision * 100).toFixed(1)),
    Recall: Number((m.recall * 100).toFixed(1)),
    F1: Number((m.f1Score * 100).toFixed(1)),
  })) || [];

  const selectedModel = data?.models.find((m) => m.name === activeModel) || data?.models[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            Machine Learning Pipeline & Evaluation
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Classifier Benchmark & Model Explainability
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rigorous comparative analysis of Logistic Regression, Random Forest, and Multinomial Naive Bayes using Stratified K-Fold cross-validation.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
          <span>{retraining ? 'Re-Evaluating Pipeline...' : 'Retrain Pipeline'}</span>
        </button>
      </div>

      {retrainSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{retrainSuccess}</span>
        </div>
      )}

      {/* ML Pipeline Flow Diagram */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            End-to-End Machine Learning System Architecture
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Supervised Learning Flow</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 text-center text-xs font-mono">
          {[
            { step: '01', title: 'Dataset', desc: '14,850 Samples' },
            { step: '02', title: 'Data Clean', desc: 'Regex & Lower' },
            { step: '03', title: 'Feature Eng.', desc: 'TF-IDF + 16 URL' },
            { step: '04', title: 'Train/Test', desc: '80/20 Stratified' },
            { step: '05', title: 'Training', desc: 'RF, LR, MNB' },
            { step: '06', title: 'Evaluation', desc: 'F1, AUC, Matrix' },
            { step: '07', title: 'Best Model', desc: 'Random Forest' },
            { step: '08', title: 'Risk Score', desc: '0–100 Weighted' },
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-cyan-400 font-bold block">{item.step}</span>
                <span className="text-slate-200 font-semibold text-[11px] block mt-0.5">{item.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparative Metrics Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Model Performance Comparison (Test Set Metrics)
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated on 2,970 test samples using balanced accuracy, precision, recall, and F1 score.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <Award className="w-4 h-4" />
            <span>Champion: Random Forest</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 font-medium">Model Architecture</th>
                <th className="pb-3 font-medium">Accuracy</th>
                <th className="pb-3 font-medium">Precision</th>
                <th className="pb-3 font-medium">Recall</th>
                <th className="pb-3 font-medium">F1 Score</th>
                <th className="pb-3 font-medium">AUC-ROC</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 text-xs">
              {data?.models.map((m) => {
                const isChampion = m.name.includes('Random Forest');
                return (
                  <tr
                    key={m.name}
                    onClick={() => setActiveModel(m.name)}
                    className={`cursor-pointer transition-colors ${
                      activeModel === m.name ? 'bg-cyan-950/30' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3.5 font-bold flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isChampion ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span>{m.name}</span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-100">{(m.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3.5 text-cyan-400 font-bold">{(m.precision * 100).toFixed(1)}%</td>
                    <td className="py-3.5 text-indigo-400 font-bold">{(m.recall * 100).toFixed(1)}%</td>
                    <td className="py-3.5 text-emerald-400 font-bold">{(m.f1Score * 100).toFixed(1)}%</td>
                    <td className="py-3.5 text-amber-400 font-bold">{m.aucRoc.toFixed(3)}</td>
                    <td className="py-3.5 text-right">
                      {isChampion ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Selected Best
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          Secondary
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Benchmark Chart + Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Comparison Bar Chart */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Classifier Metric Comparison
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Scores (%)</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontStyle="mono" />
                <YAxis domain={[80, 100]} stroke="#64748b" fontSize={11} fontStyle="mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="Accuracy" fill="#06b6d4" />
                <Bar dataKey="Precision" fill="#8b5cf6" />
                <Bar dataKey="Recall" fill="#3b82f6" />
                <Bar dataKey="F1" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Interactive Heatmap */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Confusion Matrix
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">{selectedModel?.name}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500">2,970 Test Samples</span>
          </div>

          {selectedModel && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                {/* True Negative */}
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                  <span className="text-[10px] text-emerald-400 block font-bold">True Negative (TN)</span>
                  <span className="text-xl font-bold text-slate-100 mt-1 block">
                    {selectedModel.confusionMatrix.trueNegative}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Legitimate Correct</span>
                </div>

                {/* False Positive */}
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/30">
                  <span className="text-[10px] text-rose-400 block font-bold">False Positive (FP)</span>
                  <span className="text-xl font-bold text-slate-100 mt-1 block">
                    {selectedModel.confusionMatrix.falsePositive}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Type I Error</span>
                </div>

                {/* False Negative */}
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/30">
                  <span className="text-[10px] text-rose-400 block font-bold">False Negative (FN)</span>
                  <span className="text-xl font-bold text-slate-100 mt-1 block">
                    {selectedModel.confusionMatrix.falseNegative}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Type II Error (Missed)</span>
                </div>

                {/* True Positive */}
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40">
                  <span className="text-[10px] text-cyan-400 block font-bold">True Positive (TP)</span>
                  <span className="text-xl font-bold text-slate-100 mt-1 block">
                    {selectedModel.confusionMatrix.truePositive}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Phishing Intercepted</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-sans leading-snug border-t border-slate-800/80 pt-2">
                <strong>Cyber Defense Note:</strong> In cybersecurity phishing detection, minimizing <span className="text-rose-400 font-semibold font-mono">False Negatives (FN)</span> is paramount because missing a live phishing link directly exposes user accounts to credential compromise.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Importance Ranking */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">
            Top Predictive Features (Gini Importance & SHAP Ranking)
          </h3>
          <p className="text-xs text-slate-400">
            Relative weight of extracted features in driving the final risk classification
          </p>
        </div>

        <div className="space-y-2.5">
          {data?.topFeatures.map((f, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                  0{i + 1}
                </span>
                <div>
                  <span className="text-xs font-semibold text-slate-200">{f.feature}</span>
                  <span className="text-[10px] font-mono text-cyan-400 block">{f.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-48">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${f.importance * 100 * 3.5}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-300 font-bold shrink-0">
                  {(f.importance * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
