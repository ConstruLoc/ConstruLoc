import React from 'react';
import { Modal } from 'antd';
import Link from "next/link"
import { Edit, Eye, Trash2, Download, XCircle } from "lucide-react"



type ActionsModalProps = {
    isOpen: boolean;
    menuRef: React.RefObject<HTMLDivElement>;
    menuPosition: { top: number; left: number };
    contractId: string;
    contractStatus: string;
    onDelete: () => void
    onCancel: () => void
    onDownloadPDF: () => void
    handleAction: (action: () => void) => void;
    setIsOpen: (isOpen: boolean) => void;
    handleOk: () => void;
    handleCancel: () => void;
}

const App: React.FC<ActionsModalProps> = ({
    isOpen,
    menuRef,
    menuPosition,
    contractId,
    contractStatus,
    onDelete,
    onCancel,
    onDownloadPDF,
    setIsOpen,
    handleOk,
    handleCancel,
    handleAction,
 }) => {

  return (
    <>
      <Modal
        closable={false}
        open={isOpen}
        rootClassName="actions-modal"
        onOk={handleOk}
        onCancel={handleCancel}
        style={{
            maxWidth: '20rem',
            display: 'flex',
            justifyContent: 'center',
        }}

      >
        <div
          ref={menuRef}
          className="w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-[9999] py-1"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <Link
            href={`/contratos/${contractId}`}
            className="flex items-center px-3 py-2 text-sm text-white hover:bg-slate-700 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalhes
          </Link>

          <Link
            href={`/contratos/${contractId}/editar`}
            className="flex items-center px-3 py-2 text-sm text-white hover:bg-slate-700 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>

          <button
            onClick={() => handleAction(onDownloadPDF)}
            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-slate-700 cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </button>

          {contractStatus !== "cancelado" && contractStatus !== "finalizado" && (
            <button
              onClick={() => handleAction(onCancel)}
              className="w-full flex items-center px-3 py-2 text-sm text-yellow-400 hover:bg-slate-700 cursor-pointer"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </button>
          )}

          <button
            onClick={() => handleAction(onDelete)}
            className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-slate-700 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </button>
        </div>
      </Modal>
    </>
  );
};

export default App;