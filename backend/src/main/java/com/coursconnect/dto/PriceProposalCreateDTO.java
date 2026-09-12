package com.coursconnect.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class PriceProposalCreateDTO {

    @NotNull(message = "L'offre est requise")
    private Long offerId;

    @NotNull(message = "Le prix proposé est requis")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix proposé doit être positif")
    @Digits(integer = 5, fraction = 2, message = "Prix invalide")
    private BigDecimal proposedPrice;

    @Size(max = 2000, message = "Le message ne doit pas dépasser 2000 caractères")
    private String message;

    public Long getOfferId() { return offerId; }
    public void setOfferId(Long offerId) { this.offerId = offerId; }
    public BigDecimal getProposedPrice() { return proposedPrice; }
    public void setProposedPrice(BigDecimal proposedPrice) { this.proposedPrice = proposedPrice; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}