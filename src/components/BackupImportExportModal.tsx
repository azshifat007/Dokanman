"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  exportFullBackupAction,
  exportCsvAction,
  importFullBackupAction,
  importCustomersCsvAction,
  type ImportMode,
} from "@/actions/backup-actions";
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Database,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface BackupImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  onRefresh: () => void;
}

export function BackupImportExportModal({
  isOpen,
  onClose,
  shopName,
  onRefresh,
}: BackupImportExportModalProps) {
  const { lang, t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDownloadFullJson = async () => {
    try {
      setDownloading(true);
      setMessage(null);
      const res = await exportFullBackupAction();

      if (res.success && res.backup) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(res.backup, null, 2)
        )}`;
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute(
          "download",
          `dokanman_backup_${shopName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setMessage({
          type: "success",
          text: lang === "bn" ? "সম্পূর্ণ ব্যাকআপ ফাইল ডাউনলোড সম্পন্ন হয়েছে!" : "Backup downloaded successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: res.error || "ব্যাকআপ তৈরিতে সমস্যা হয়েছে",
        });
      }
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "সমস্যা হয়েছে" });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCsv = async (type: "customers" | "transactions" | "orders" | "expenses") => {
    try {
      setDownloading(true);
      setMessage(null);
      const res = await exportCsvAction(type);

      if (res.success && res.csv && res.filename) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        setMessage({
          type: "success",
          text: lang === "bn" ? "CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে!" : "CSV downloaded successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: res.error || "CSV তৈরিতে ব্যর্থ হয়েছে",
        });
      }
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "সমস্যা হয়েছে" });
    } finally {
      setDownloading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setRestoring(true);
        setMessage(null);
        const content = event.target?.result as string;
        const res = await importFullBackupAction(content, importMode);

        if (res.success) {
          setMessage({
            type: "success",
            text: lang === "bn" ? "ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!" : "Backup restored successfully!",
          });
          onRefresh();
        } else {
          setMessage({
            type: "error",
            text: res.error || "ফাইল রিস্টোর করতে ব্যর্থ হয়েছে",
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "ফাইলটি বৈধ JSON ব্যাকআপ নয়",
        });
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const handleCustomersCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImportingCsv(true);
        setMessage(null);
        const content = (event.target?.result as string) || "";
        const res = await importCustomersCsvAction(content);

        if (res.success) {
          setMessage({
            type: "success",
            text:
              lang === "bn"
                ? `ইমপোর্ট সম্পন্ন: ${res.imported ?? 0} জন নতুন, ${res.skipped ?? 0} জন ডুপ্লিকেট বাদ, ${res.invalid ?? 0} টি ভুল সারি।`
                : `Import complete: ${res.imported ?? 0} added, ${res.skipped ?? 0} duplicates skipped, ${res.invalid ?? 0} invalid rows.`,
          });
          onRefresh();
        } else {
          setMessage({
            type: "error",
            text: res.error || "CSV ইমপোর্ট করতে ব্যর্থ হয়েছে",
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "CSV ফাইলটি পড়া যায়নি",
        });
      } finally {
        setImportingCsv(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-950/70">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Database className="w-5 h-5" />
            <span>{t("backupTitle")}</span>
          </div>
          <button
            onClick={onClose}
            aria-label={t("cancel")}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`m-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-950/60 border border-emerald-700/60 text-emerald-300"
                : "bg-rose-950/60 border border-rose-700/60 text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="p-5 space-y-5 overflow-y-auto max-h-[460px]">
          {/* Section 1: Full JSON Backup */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Database className="w-4 h-4 text-amber-400" />
              <span>{t("exportJsonBackup")}</span>
            </div>
            <p className="text-xs text-zinc-400">{t("exportJsonDesc")}</p>

            <button
              type="button"
              onClick={handleDownloadFullJson}
              disabled={downloading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("downloading")}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t("downloadJsonBtn")}</span>
                </>
              )}
            </button>
          </div>

          {/* Section 2: CSV Exports */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{t("csvExportHeading")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDownloadCsv("customers")}
                disabled={downloading}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-left text-xs text-zinc-200 transition-colors"
              >
                <div className="font-semibold text-white">{t("exportCustomersCsv")}</div>
                <div className="text-[10px] text-zinc-400">{t("customersCsvSub")}</div>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadCsv("transactions")}
                disabled={downloading}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-left text-xs text-zinc-200 transition-colors"
              >
                <div className="font-semibold text-white">{t("exportTransactionsCsv")}</div>
                <div className="text-[10px] text-zinc-400">{t("transactionsCsvSub")}</div>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadCsv("orders")}
                disabled={downloading}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-left text-xs text-zinc-200 transition-colors"
              >
                <div className="font-semibold text-white">{t("exportOrdersCsv")}</div>
                <div className="text-[10px] text-zinc-400">{t("ordersCsvSub")}</div>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadCsv("expenses")}
                disabled={downloading}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-left text-xs text-zinc-200 transition-colors"
              >
                <div className="font-semibold text-white">{t("csvExpenses")}</div>
                <div className="text-[10px] text-zinc-400">{t("csvExpensesSub")}</div>
              </button>
            </div>
          </div>

          {/* Section 3: Restore Backup */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>{t("restoreBackupTitle")}</span>
            </div>
            <p className="text-xs text-zinc-400">{t("restoreBackupDesc")}</p>

            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold text-zinc-400">
                {t("importModeLabel")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode("merge")}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-colors ${
                    importMode === "merge"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                  }`}
                >
                  {t("importModeMerge")}
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("replace")}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-colors ${
                    importMode === "replace"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                  }`}
                >
                  {t("importModeReplace")}
                </button>
              </div>
              {importMode === "replace" && (
                <p className="text-[10px] text-rose-400/90">
                  {lang === "bn"
                    ? "সতর্কতা: রিপ্লেস করলে আপনার বর্তমান সকল পণ্য, কাস্টমার ও লেনদেন মুছে যাবে।"
                    : "Warning: replacing deletes all your current products, customers and ledger records."}
                </p>
              )}
            </div>

            <label className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>{t("restoringNow")}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>{t("uploadAndRestore")} (.json)</span>
                </>
              )}
              <input
                type="file"
                accept=".json"
                disabled={restoring}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Section 4: Customers CSV Import */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>{t("importCustomersCsvTitle")}</span>
            </div>
            <p className="text-xs text-zinc-400">{t("importCustomersCsvDesc")}</p>

            <label className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
              {importingCsv ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{t("importingNow")}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{t("importCustomersCsvBtn")} (.csv)</span>
                </>
              )}
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={importingCsv}
                onChange={handleCustomersCsvUpload}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-zinc-500 font-mono">
              {lang === "bn"
                ? "কলাম: নাম, মোবাইল নম্বর, পূর্বের বাকি (যেমন: করিম ভাই,01711112222,140)"
                : "Columns: Name, Phone, Starting Due (e.g. Karim,01711112222,140)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
