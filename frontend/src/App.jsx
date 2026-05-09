import { useEffect, useState } from "react";

function App() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/services")
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🏥 Hospital Billing Assistant</h1>
      <h2>Service Catalog</h2>
      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Service Name</th>
            <th>Category</th>
            <th>Price (₹)</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.category}</td>
              <td>₹{s.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;