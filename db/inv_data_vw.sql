SELECT
    a.rowid as id,
    a.contract_id,
    a.contract_no,
    a.contract_date,
    b.client_id,
    b.client_name,
    b.client_email,
    b.client_phone,
    (
        SELECT
            group_concat('#' 
                || inv.invoice_no 
                || '/' 
                || inv.invoice_date 
                || ': <strong>' 
                || (
                    SELECT 
                        SUM(y.price * y.qty)
                    FROM 
                        inv_invoice x, 
                        inv_invoice_line y 
                    WHERE 
                        x.invoice_id = y.invoice_id 
                        AND x.invoice_id = inv.invoice_id
                )
                || ' Lei</strong>')
        FROM
            inv_invoice inv
        WHERE
            inv.contract_id = a.contract_id
    ) AS invoice
FROM
    inv_contract a,
    inv_client b
WHERE
    a.client_id = b.client_id
    AND a.status = 'enabled'