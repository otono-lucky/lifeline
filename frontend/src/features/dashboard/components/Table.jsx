import React from "react";

export const Table = ({
  columns,
  data,
  loading = false,
  onRowClick = null,
  actions = null,
}) => {
  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-gray-500">No data found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
