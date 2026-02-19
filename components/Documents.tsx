import React from 'react';
import { DocumentRequest, RequestStatus } from '../types';
import { FileText, Check, X, Clock } from 'lucide-react';

interface DocumentsProps {
  requests: DocumentRequest[];
  setRequests: React.Dispatch<React.SetStateAction<DocumentRequest[]>>;
}

const Documents: React.FC<DocumentsProps> = ({ requests, setRequests }) => {

  const handleUpdateStatus = (id: string, newStatus: RequestStatus) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return 'bg-orange-50 text-orange-600 border-orange-100';
      case RequestStatus.APPROVED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case RequestStatus.REJECTED: return 'bg-red-50 text-red-600 border-red-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Permohonan Surat</h2>
        <p className="text-slate-500 text-sm">Kelola pengajuan surat pengantar warga</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(request => (
          <div key={request.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl border-l border-b ${getStatusColor(request.status)}`}>
              {request.status}
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{request.type}</h3>
                <p className="text-sm text-slate-500">{request.residentName}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span className="font-medium">{request.date}</span>
              </div>
              {request.notes && (
                <div className="bg-slate-50 p-2 rounded text-xs italic">
                  "{request.notes}"
                </div>
              )}
            </div>

            {request.status === RequestStatus.PENDING && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdateStatus(request.id, RequestStatus.APPROVED)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <Check className="w-4 h-4" /> Setujui
                </button>
                <button 
                  onClick={() => handleUpdateStatus(request.id, RequestStatus.REJECTED)}
                  className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" /> Tolak
                </button>
              </div>
            )}
             {request.status !== RequestStatus.PENDING && (
                <div className="text-center text-xs text-slate-400 py-2">
                    Permohonan telah diproses
                </div>
             )}
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada permohonan surat masuk.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;