-- Assign remaining products to collections based on handle patterns
-- na- = Napery (Table Linen)
-- bl- = Bed Linen  
-- kl- = Kitchen Linen (Tea Towels & Aprons)
-- hd- = Home Decor (Cushions & Curtains)
-- ba- = Bathroom Linens (Towels)

-- Kitchen Linen Collections (kl-*)
UPDATE product SET collection_id = 'pcol_kl_ber' WHERE handle LIKE 'kl-ber-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_cag' WHERE handle LIKE 'kl-cag-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_edg' WHERE handle LIKE 'kl-edg-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_fel' WHERE handle LIKE 'kl-fel-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_fm' WHERE handle LIKE 'kl-fm-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_he' WHERE handle LIKE 'kl-he-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_is' WHERE handle LIKE 'kl-is-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_lec' WHERE handle LIKE 'kl-lec-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_les' WHERE handle LIKE 'kl-les-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_mc' WHERE handle LIKE 'kl-mc-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_oli' WHERE handle LIKE 'kl-oli-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_pl' WHERE handle LIKE 'kl-pl-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_st' WHERE handle LIKE 'kl-st-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_t' WHERE handle LIKE 'kl-t-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_kl_tus' WHERE handle LIKE 'kl-tus-%' AND deleted_at IS NULL;

-- Additional Napery Collections (na-*)
UPDATE product SET collection_id = 'pcol_na_tr' WHERE handle LIKE 'na-tr-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_a' WHERE handle LIKE 'na-a-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_alb' WHERE handle LIKE 'na-alb-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_ber' WHERE handle LIKE 'na-ber-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_eco' WHERE handle LIKE 'na-eco-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_es' WHERE handle LIKE 'na-es-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_fel' WHERE handle LIKE 'na-fel-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_fme' WHERE handle LIKE 'na-fme-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_fmo' WHERE handle LIKE 'na-fmo-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_ha' WHERE handle LIKE 'na-ha-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_har' WHERE handle LIKE 'na-har-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_l' WHERE handle LIKE 'na-l-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_mc' WHERE handle LIKE 'na-mc-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_mcd' WHERE handle LIKE 'na-mcd-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_mch' WHERE handle LIKE 'na-mch-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_mcs' WHERE handle LIKE 'na-mcs-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_mor' WHERE handle LIKE 'na-mor-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_pe' WHERE handle LIKE 'na-pe-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_pic' WHERE handle LIKE 'na-pic-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_pur' WHERE handle LIKE 'na-pur-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_sb' WHERE handle LIKE 'na-sb-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_sca' WHERE handle LIKE 'na-sca-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_so' WHERE handle LIKE 'na-so-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_t' WHERE handle LIKE 'na-t-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_tre' WHERE handle LIKE 'na-tre-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_tus' WHERE handle LIKE 'na-tus-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_na_ver' WHERE handle LIKE 'na-ver-%' AND deleted_at IS NULL;

-- Additional Bed Linen Collections (bl-*)
UPDATE product SET collection_id = 'pcol_bl_arcs' WHERE handle LIKE 'bl-arcs-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_bl_cas' WHERE handle LIKE 'bl-cas-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_bl_ftd' WHERE handle LIKE 'bl-ftd-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_bl_imp' WHERE handle LIKE 'bl-imp-%' AND deleted_at IS NULL;

-- Home Decor Collections (hd-*) - Cushions & Curtains
UPDATE product SET collection_id = 'pcol_hd_ch' WHERE handle LIKE 'hd-ch-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_cop' WHERE handle LIKE 'hd-cop-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_gen' WHERE handle LIKE 'hd-gen-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_gr' WHERE handle LIKE 'hd-gr-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_guell' WHERE handle LIKE 'hd-guell-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_hamp' WHERE handle LIKE 'hd-hamp-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_irma' WHERE handle LIKE 'hd-irma-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_lace' WHERE handle LIKE 'hd-lace-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_lam' WHERE handle LIKE 'hd-lam-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_mar' WHERE handle LIKE 'hd-mar-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_mlr' WHERE handle LIKE 'hd-mlr-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_mnk' WHERE handle LIKE 'hd-mnk-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_ning' WHERE handle LIKE 'hd-ning-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_osa' WHERE handle LIKE 'hd-osa-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_riga' WHERE handle LIKE 'hd-riga-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_s' WHERE handle LIKE 'hd-s-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_sym' WHERE handle LIKE 'hd-sym-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_talin' WHERE handle LIKE 'hd-talin-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_tok' WHERE handle LIKE 'hd-tok-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_u' WHERE handle LIKE 'hd-u-%' AND deleted_at IS NULL;
UPDATE product SET collection_id = 'pcol_hd_v' WHERE handle LIKE 'hd-v-%' AND deleted_at IS NULL;

-- Bathroom Linens Collections (ba-*)
UPDATE product SET collection_id = 'pcol_ba_c' WHERE handle LIKE 'ba-c-%' AND deleted_at IS NULL;

-- Verify the assignments
SELECT 
    pc.title as collection_name,
    COUNT(p.id) as product_count
FROM product_collection pc
LEFT JOIN product p ON pc.id = p.collection_id AND p.deleted_at IS NULL
GROUP BY pc.id, pc.title
ORDER BY pc.title;

-- Check for any unassigned products
SELECT COUNT(*) as unassigned_products 
FROM product 
WHERE collection_id IS NULL AND deleted_at IS NULL;
