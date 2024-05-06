import { useEffect, useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import DOMPurify from 'dompurify';
import { getData, getDataWithDebounce } from './api/getData';
import { Filter } from './components/Filter';

function DataTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    'sender_FIO': "",
    'sender_email': "",
    'message': ""
  });

  const toggleFilters = (event, filterKey) => {
    const newFilters = { ...filters, [filterKey]: event.target.value };
    setFilters(newFilters);
    const firstPage = 1;
    setPage(firstPage);
    getDataWithDebounce(firstPage, pageSize, newFilters, setData, setTotalPages, setLoading);
  }

  const togglePage = (value) => {
    setPage(value);
    getDataWithDebounce(value, pageSize, filters, setData, setTotalPages, setLoading);
  }

  const togglePageSize = (value) => {
    setPageSize(value);
    const firstPage = 1;
    setPage(firstPage);
    getDataWithDebounce(firstPage, value, filters, setData, setTotalPages, setLoading);
  }

  useEffect(() => {
    getData(page, pageSize, filters, setData, setTotalPages, setLoading);
  }, []);

  const columns = useMemo(() => [
    { header: 'Отправитель', accessorKey: 'sender_FIO' },
    { header: 'Email', accessorKey: 'sender_email' },
    {
      header: 'Дата', accessorKey: 'message_date',
      cell: (timestamp) => {
        const date = new Date(Number(timestamp.getValue()) * 1000);
        return date.toLocaleDateString();
      },
      enableColumnFilter: false,
    },
    {
      header: 'Обращение', accessorKey: 'message',
      cell: (message) => {
        const cleanMessage = message.getValue().replace(/^<br\s*\/?>/i, '');
        return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cleanMessage) }} />
      }
    },
  ], []);

  const {
    getHeaderGroups,
    getRowModel
  } = useReactTable({
    columns,
    data,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel()
  });

  return (loading ? <div>"Loading..."</div> : <div className="p-2">
    <table>
      <thead>
        {getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id} className='align-baseline py-1'>
                {header.isPlaceholder ? null : (
                  <>
                    <div>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                    {
                      header.column.getCanFilter() ?
                        <div>
                          <Filter filter={filters[header.column.columnDef.accessorKey]} onChange={(event) => toggleFilters(event, header.column.columnDef.accessorKey)} />
                        </div> : null
                    }
                  </>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {getRowModel().rows.map(row => (
          <tr key={row.id} className='align-baseline'>
            {row.getAllCells().map(cell => (
              <td key={cell.id} className='p-4'>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <div className="h-2" />
    <div className="flex items-center gap-2">
      <button
        className="border rounded p-1"
        onClick={() => togglePage(1)}
        disabled={page === 1}
      >
        {'<<'}
      </button>
      <button
        className="border rounded p-1"
        onClick={() => togglePage(Math.max(page - 1, 1))}
        disabled={page === 1}
      >
        {'<'}
      </button>
      <button
        className="border rounded p-1"
        onClick={() => togglePage(page < totalPages ? page + 1 : page)}
        disabled={page === totalPages || totalPages === 0}
      >
        {'>'}
      </button>
      <button
        className="border rounded p-1"
        onClick={() => togglePage(totalPages)}
        disabled={page === totalPages || totalPages === 0}
      >
        {'>>'}
      </button>
      <span className="flex items-center gap-1">
        <div>Page</div>
        <strong>
          {`${page} of ${totalPages}`}
        </strong>
      </span>
      <span className="flex items-center gap-1">
        | Go to page:
        <input
          type="number"
          onChange={e => {
            togglePage(Number(e.target.value))
          }}
          className="border p-1 rounded w-16"
          aria-label='Page number input'
        />
      </span>
      <select
        value={pageSize}
        onChange={e => {
          togglePageSize(Number(e.target.value))
        }}
        aria-label='Page size selector'
      >
        {[10, 20, 30, 40, 50].map(pageSize => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  </div>
  );
}

export default DataTable;
