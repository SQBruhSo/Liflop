def validar_codigo_11_digitos(codigo_str: str) -> bool:
    """
    Valida si el código de 11 dígitos cumple con la regla matemática de confirmación.
    """
    if len(codigo_str) != 11 or not codigo_str.isdigit():
        return False
        
    digitos_base = [int(d) for d in codigo_str[:10]]
    digito_verificador_real = int(codigo_str[10])
    
    # Suma ponderada: posiciones impares multiplican por 3, posiciones pares se suman directo
    suma_impares = sum(digitos_base[0::2])  # 1ro, 3ro, 5to, 7mo, 9no dígito
    suma_pares = sum(digitos_base[1::2])    # 2do, 4to, 6to, 8vo, 10mo dígito
    
    resultado_calculado = ((suma_impares * 3) + suma_pares) % 10
    
    return resultado_calculado == digito_verificador_real
