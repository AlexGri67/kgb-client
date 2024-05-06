export const Filter = ({ filter, onChange }) => (
  <input
    value={filter}
    onChange={onChange}
    className="w-full border shadow rounded"
    placeholder={'Поиск...'}
    type="text"
  />
);
