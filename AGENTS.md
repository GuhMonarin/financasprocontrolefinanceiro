# Project Architecture Rules

- Store expense payment state on each transaction using `is_paid`; this keeps installments independently payable and preserves monthly reporting.