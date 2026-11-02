import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Upload, FileSpreadsheet, Check, AlertCircle, Download, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ isOpen, onClose, jobId }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownloadSample = () => {
    const csvContent =
      'name,email,profileUrl,skills,experienceSummary\n' +
      'Alex Johnson,alex.j@example.com,https://linkedin.com/in/alex-johnson,"React, TypeScript, Node.js",5 years full stack engineering\n' +
      'Samantha Lee,samantha.l@example.com,https://linkedin.com/in/samantha-lee,"Distributed Systems, Go, Redis",Senior backend developer\n' +
      'David Miller,david.m@example.com,https://linkedin.com/in/david-miller,"React, Tailwind, GraphQL",Frontend specialist';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'aironauts_candidates_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !jobId) return;

    setIsUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res: any = await api.post(`/jobs/${jobId}/candidates/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data?.data || res.data);
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', jobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', jobId] });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'CSV upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Candidates via CSV" maxWidth="md">
      <div className="space-y-4">
        {/* Helper info */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span>Supported columns: name, email, profileUrl, skills, experienceSummary</span>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Sample CSV
          </button>
        </div>

        {/* Upload Drop Area */}
        {!result && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              selectedFile
                ? 'border-indigo-400 bg-indigo-50/20'
                : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600 mb-2">
              {selectedFile ? <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> : <Upload className="w-5 h-5" />}
            </div>
            {selectedFile ? (
              <div>
                <p className="text-xs font-semibold text-slate-900">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-800">Click to browse or drop CSV file</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Deduplication automatically applied</p>
              </div>
            )}
          </div>
        )}

        {/* Error notice */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Results view */}
        {result && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Import Process Completed</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">Imported New</span>
                <p className="text-lg font-bold text-emerald-600">{result.importedCount || 0}</p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">Duplicates Skipped</span>
                <p className="text-lg font-bold text-amber-600">{result.duplicateCount || 0}</p>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-rose-700">Errors ({result.errors.length} rows):</span>
                <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-rose-600">
                  {result.errors.map((e: any, idx: number) => (
                    <div key={idx} className="bg-rose-50 p-1.5 rounded">
                      Row {e.row}: {e.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          {result ? (
            <>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Import Another File
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Done
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedFile}
                isLoading={isUploading}
                onClick={handleUpload}
              >
                <FileText className="w-3.5 h-3.5 mr-1" /> Import Candidates
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

