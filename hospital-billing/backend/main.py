from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Hospital Billing Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Patient(BaseModel):
    name: str
    age: int
    phone: str

class InvoiceItem(BaseModel):
    service_id: int
    quantity: int

class Invoice(BaseModel):
    patient_id: int
    items: list[InvoiceItem]
    discount: Optional[float] = 0
    tax: Optional[float] = 18

@app.get("/")
def home():
    return {"message": "Hospital Billing Assistant API is running!"}

@app.get("/patients")
def get_patients():
    result = supabase.table("patients").select("*").execute()
    return result.data

@app.post("/patients")
def add_patient(patient: Patient):
    result = supabase.table("patients").insert({
        "name": patient.name,
        "age": patient.age,
        "phone": patient.phone
    }).execute()
    return {"message": "Patient added!", "data": result.data}

@app.get("/services")
def get_services():
    result = supabase.table("services").select("*").execute()
    return result.data

@app.get("/invoices")
def get_invoices():
    result = supabase.table("invoices").select("*, patients(name)").execute()
    return result.data

@app.post("/invoices")
def create_invoice(invoice: Invoice):
    total = 0
    items_to_insert = []

    for item in invoice.items:
        service = supabase.table("services").select("*").eq("id", item.service_id).execute()
        if not service.data:
            raise HTTPException(status_code=404, detail=f"Service not found")
        service_price = service.data[0]["price"]
        line_total = service_price * item.quantity
        total += line_total
        items_to_insert.append({
            "service_id": item.service_id,
            "quantity": item.quantity,
            "price": line_total
        })

    discount_amount = total * (invoice.discount / 100)
    after_discount = total - discount_amount
    tax_amount = after_discount * (invoice.tax / 100)
    final = after_discount + tax_amount

    inv_result = supabase.table("invoices").insert({
        "patient_id": invoice.patient_id,
        "total_amount": total,
        "discount": invoice.discount,
        "tax": invoice.tax,
        "final_amount": round(final, 2)
    }).execute()

    invoice_id = inv_result.data[0]["id"]

    for it in items_to_insert:
        it["invoice_id"] = invoice_id
    supabase.table("invoice_items").insert(items_to_insert).execute()

    return {
        "message": "Invoice created!",
        "invoice_id": invoice_id,
        "total": total,
        "discount": discount_amount,
        "tax": tax_amount,
        "final_amount": round(final, 2)
    }

@app.get("/invoices/{invoice_id}")
def get_invoice_detail(invoice_id: int):
    invoice = supabase.table("invoices").select("*, patients(name)").eq("id", invoice_id).execute()
    if not invoice.data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    items = supabase.table("invoice_items").select("*, services(name)").eq("invoice_id", invoice_id).execute()
    return {"invoice": invoice.data[0], "items": items.data}