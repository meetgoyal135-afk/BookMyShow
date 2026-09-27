package com.cfs.BMS.dto;

import com.cfs.BMS.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Result returned to a theatre gate scanner after verifying / checking-in a ticket.
 * admit=true means the guest can enter. Otherwise reason explains the rejection.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GateVerifyResponse {

    private boolean admit;
    private String result;   // ADMITTED | ALREADY_USED | CANCELLED | NOT_FOUND | INVALID
    private String message;
    private Booking booking;  // null when not found / invalid
}
