import { useEffect, useState } from "react";

function App() {
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState("services");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [invoiceResult, setInvoiceResult] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/services")
      .then((res) => res.json())
      .then((data) => setServices(data));

    fetch("http://127.0.0.1:8000/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data));

    fetch("http://127.0.0.1:8000/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data));
  }, []);

  const addPatient = () => {
    fetch("http://127.0.0.1:8000/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age: parseInt(age), phone }),
    })
      .then((res) => res.json())
      .then(() => {
        setMessage("Patient added successfully! ✅");
        setName("");
        setAge("");
        setPhone("");
        fetch("http://127.0.0.1:8000/patients")
          .then((res) => res.json())
          .then((data) => setPatients(data));
      });
  };

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const createInvoice = () => {
    const items = selectedServices.map((id) => ({
      service_id: id,
      quantity: 1,
    }));

    fetch("http://127.0.0.1:8000/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: parseInt(selectedPatient),
        items,
        discount: parseFloat(discount),
        tax: 18,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setInvoiceResult(data);
        fetch("http://127.0.0.1:8000/invoices")
          .then((res) => res.json())
          .then((data) => setInvoices(data));
      });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🏥 Hospital Billing Assistant</h1>

      {/* Navigation */}
      <button onClick={() => setPage("services")}
        style={{ marginRight: "10px", padding: "10px", background: page === "services" ? "blue" : "gray", color: "white", border: "none", cursor: "pointer" }}>
        Services
      </button>
      <button onClick={() => setPage("patients")}
        style={{ marginRight: "10px", padding: "10px", background: page === "patients" ? "blue" : "gray", color: "white", border: "none", cursor: "pointer" }}>
        Patients
      </button>
      <button onClick={() => setPage("invoice")}
        style={{ marginRight: "10px", padding: "10px", background: page === "invoice" ? "blue" : "gray", color: "white", border: "none", cursor: "pointer" }}>
        Create Invoice
      </button>
      <button onClick={() => setPage("history")}
        style={{ padding: "10px", background: page === "history" ? "blue" : "gray", color: "white", border: "none", cursor: "pointer" }}>
        Invoice History
      </button>

      <hr />

      {/* Services Page */}
      {page === "services" && (
        <div>
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
      )}

      {/* Patients Page */}
      {page === "patients" && (
        <div>
          <h2>Add New Patient</h2>
          <input placeholder="Name" value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }} />
          <input placeholder="Age" value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }} />
          <input placeholder="Phone" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }} />
          <button onClick={addPatient}
            style={{ padding: "10px 20px", background: "green", color: "white", border: "none", cursor: "pointer" }}>
            Add Patient
          </button>
          {message && <p style={{ color: "green" }}>{message}</p>}

          <h2>All Patients</h2>
          <table border="1" cellPadding="10" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invoice Page */}
      {page === "invoice" && (
        <div>
          <h2>Create Invoice</h2>

          <label>Select Patient:</label>
          <select value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }}>
            <option value="">-- Select Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <label>Select Services:</label>
          <div style={{ margin: "10px 0" }}>
            {services.map((s) => (
              <div key={s.id}>
                <input type="checkbox"
                  checked={selectedServices.includes(s.id)}
                  onChange={() => toggleService(s.id)} />
                {s.name} — ₹{s.price}
              </div>
            ))}
          </div>

          <label>Discount %:</label>
          <input type="number" value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }} />

          <button onClick={createInvoice}
            style={{ padding: "10px 20px", background: "green", color: "white", border: "none", cursor: "pointer" }}>
            Generate Bill 🧾
          </button>

          {invoiceResult && (
            <div style={{ marginTop: "20px", padding: "15px", border: "1px solid green" }}>
              <h3>✅ Invoice Generated!</h3>
              <p>Total Amount: ₹{invoiceResult.total_amount}</p>
              <p>Discount: ₹{invoiceResult.discount_applied}</p>
              <p>Tax (18% GST): ₹{invoiceResult.tax_applied}</p>
              <h2>Final Amount: ₹{invoiceResult.final_amount}</h2>
            </div>
          )}
        </div>
      )}

      {/* Invoice History Page */}
      {page === "history" && (
        <div>
          <h2>Invoice History</h2>
          <table border="1" cellPadding="10" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Total</th>
                <th>Discount</th>
                <th>Tax</th>
                <th>Final Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td>{i.id}</td>
                  <td>{i.patients?.name}</td>
                  <td>₹{i.total_amount}</td>
                  <td>{i.discount}%</td>
                  <td>{i.tax}%</td>
                  <td>₹{i.final_amount}</td>
                  <td>{new Date(i.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;