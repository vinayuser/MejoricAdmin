import React, { useState } from "react";
import { Plus, Eye, Pencil, Trash2, ClipboardPlus, History } from "lucide-react";

const Table = ({
  columns,
  data,
  onRowClick,
  onAddNew,
  onView,
  onEdit,
  onDelete,
  onReport,
  onHistory,
  title,
  description,
  addButtonText = "Add new",
  addButtonIcon: AddIcon = Plus,
  isLoading = false,
}) => {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowSelect = (row) => {
    setSelectedRow(row);
    onRowClick?.(row);
  };

  const ActionButton = ({ onClick, icon: Icon, title, hoverColorClass, hoverBgClass }) => (
    <div className="relative group/tip flex items-center justify-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`rounded-md p-1.5 text-slate-500 transition-colors ${hoverBgClass} ${hoverColorClass}`}
      >
        <Icon className="h-4 w-4" />
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-y-[-2px] pointer-events-none z-50 shadow-lg">
        {title}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      )}

      {(title || onAddNew) && (
        <div className="flex flex-col gap-4 border-b border-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <AddIcon className="h-4 w-4" />
              {addButtonText}
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, index) => (
              <tr
                key={row._id || index}
                onClick={() => handleRowSelect(row)}
                className="group hover:bg-slate-50/50 transition-colors cursor-default"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-slate-600">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onView && <ActionButton onClick={() => onView(row)} icon={Eye} title="View" hoverBgClass="hover:bg-slate-100" hoverColorClass="hover:text-slate-900" />}
                    {onEdit && <ActionButton onClick={() => onEdit(row)} icon={Pencil} title="Edit" hoverBgClass="hover:bg-slate-100" hoverColorClass="hover:text-slate-900" />}
                    {onReport && <ActionButton onClick={() => onReport(row)} icon={ClipboardPlus} title="Report" hoverBgClass="hover:bg-slate-100" hoverColorClass="hover:text-slate-900" />}
                    {onHistory && <ActionButton onClick={() => onHistory(row)} icon={History} title="History" hoverBgClass="hover:bg-slate-100" hoverColorClass="hover:text-slate-900" />}
                    {onDelete && <ActionButton onClick={() => onDelete(row)} icon={Trash2} title="Delete" hoverBgClass="hover:bg-red-50" hoverColorClass="hover:text-red-600" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && !isLoading && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-400">No records found.</p>
        </div>
      )}
    </div>
  );
};

export default Table;
