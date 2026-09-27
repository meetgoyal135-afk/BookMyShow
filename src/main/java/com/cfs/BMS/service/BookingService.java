package com.cfs.BMS.service;


import com.cfs.BMS.dto.BookingRequest;
import com.cfs.BMS.dto.GateVerifyResponse;
import com.cfs.BMS.entity.*;
import com.cfs.BMS.enums.BookingStatus;
import com.cfs.BMS.repository.BookingRepository;
import com.cfs.BMS.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.print.Book;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final UserService userService;
    private final ShowService showService;

    @Transactional
    public Booking createBooking(BookingRequest request)
    {
        User user=userService.getUserById(request.getUserId());
        Show show=showService.getShowById(request.getShowId());

        //check if any of the requested seat are already booked
        List<Long> alreadyBookedSeats=bookingRepository.findBookedSeatIdsByShowId(show.getId());
        for(Long seatId:request.getSeatIds())
        {
            if(alreadyBookedSeats.contains(seatId))
            {
                throw new RuntimeException("Seat with id "+seatId+" is already Booked");
            }
        }

        List<Seat> seats=seatRepository.findAllById(request.getSeatIds());
        if(seats.size()!=request.getSeatIds().size())
        {
            throw new RuntimeException("Some Seats Are Invalid");
        }

        double totalPrice=seats.size()*show.getTicketPrice();
        Booking booking=Booking.builder()
                .user(user)
                .show(show)
                .seats(seats)
                .totalPrice(totalPrice)
                .status(BookingStatus.CONFIRMED)
                .build();

        return bookingRepository.save(booking);
    }

    public Booking getBookingById(Long id)
    {
        return bookingRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Booking not found with id: "+id));

    }

    public List<Booking> getBookingByUser(Long userId)
    {
        return bookingRepository.findByUserId(userId);
    }

    @Transactional
    public Booking cancelbooking(Long bookingid)
    {
        Booking booking=getBookingById(bookingid);
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public List<Seat> getAvailableSeats(Long showId)
    {
        Show show=showService.getShowById(showId);
        List<Seat> allSeats=seatRepository.findByScreenId(show.getScreen().getId());
        List<Long> bookingSeatIds=bookingRepository.findBookedSeatIdsByShowId(showId);
        return allSeats.stream()
                .filter(seat -> !bookingSeatIds.contains(seat.getId()))
                .toList();
    }

    /**
     * Verify a ticket at the gate WITHOUT checking it in (read-only preview).
     */
    public GateVerifyResponse verify(Long bookingId)
    {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            return GateVerifyResponse.builder()
                    .admit(false).result("NOT_FOUND")
                    .message("No ticket found for this code.").build();
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return GateVerifyResponse.builder()
                    .admit(false).result("CANCELLED")
                    .message("This ticket was cancelled and is not valid.")
                    .booking(booking).build();
        }
        if (booking.isCheckedIn()) {
            return GateVerifyResponse.builder()
                    .admit(false).result("ALREADY_USED")
                    .message("This ticket has already been used at "
                            + (booking.getCheckedInAt() != null ? booking.getCheckedInAt() : "the gate") + ".")
                    .booking(booking).build();
        }
        return GateVerifyResponse.builder()
                .admit(true).result("VALID")
                .message("Valid ticket. Ready to admit.")
                .booking(booking).build();
    }

    /**
     * Check a ticket in at the gate. Single-use: a confirmed ticket is admitted once,
     * then marked used so a second scan is rejected. Cancelled/invalid are rejected.
     */
    @Transactional
    public GateVerifyResponse checkIn(Long bookingId)
    {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            return GateVerifyResponse.builder()
                    .admit(false).result("NOT_FOUND")
                    .message("No ticket found for this code.").build();
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return GateVerifyResponse.builder()
                    .admit(false).result("CANCELLED")
                    .message("This ticket was cancelled and is not valid.")
                    .booking(booking).build();
        }
        if (booking.isCheckedIn()) {
            return GateVerifyResponse.builder()
                    .admit(false).result("ALREADY_USED")
                    .message("Entry denied - this ticket was already scanned at "
                            + (booking.getCheckedInAt() != null ? booking.getCheckedInAt() : "the gate") + ".")
                    .booking(booking).build();
        }
        booking.setCheckedIn(true);
        booking.setCheckedInAt(java.time.LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        return GateVerifyResponse.builder()
                .admit(true).result("ADMITTED")
                .message("Welcome! Entry granted.")
                .booking(saved).build();
    }
}
