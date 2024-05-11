import BookingDetails from "../models/BookingDetails.js";
import Day from "../models/Day.js";
import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";
import User from "../models/User.js";

/**
 *  reservation @param { name, phone, email, date, tableNumber, capacity }
 */

// RESERVE
const reserveTable = async (req, res, next) => {
  console.log("Reservation Submitted");
  // Booking details
  const {
    table: selectedTableNumber,
    capacity: selectedTableCapacity,
    date: selectedDateTime,
    name,
    phone,
    email,
  } = req.body;
  const { userId } = req.query;

  try {
    const days = await Day.find({ date: selectedDateTime });
    let day;

    if (days.length > 0) {
      day = days[0];
    } else {
      // Create a new Day reservation if none exists
      day = new Day({ date: selectedDateTime, tables: [] });
      await day.save();
    }

    // Search selected table within the day's tables.
    const existingTable = day.tables.find(
      (table) => table.number === selectedTableNumber
    );

    // Found
    if (existingTable) {
      const table = existingTable;
      // const table = await Table.create({
      //   number: existingTable.number,
      //   capacity: existingTable.capacity,
      //   isAvailable: existingTable.isAvailable,
      // });
      if (table.isAvailable) {
        table.isAvailable = false;
        const bookingDetails = await BookingDetails.create({
          name,
          phone,
          email,
          tableNumber: selectedTableNumber,
          tableCapacity: selectedTableCapacity,
        });
        const reservation = await Reservation.create({
          userId,
          bookingDetails: bookingDetails._id,
          table: table._id,
          date: selectedDateTime,
        });
        table.reservation = reservation._id;
        await day.save();
        // await table.save();
        console.log("Reserved");
        res.status(200).send("Added Reservation");
      } else {
        console.log("Table not available");
        res.status(400).send("Table not available");
      }
    } else {
      const newTable = await Table.create({
        number: selectedTableNumber,
        capacity: selectedTableCapacity,
        isAvailable: false,
        reservation: null,
      });

      const bookingDetails = await BookingDetails.create({
        name,
        phone,
        email,
        tableNumber: selectedTableNumber,
        tableCapacity: selectedTableCapacity,
      });

      const reservation = await Reservation.create({
        userId,
        bookingDetails: bookingDetails._id,
        table: newTable._id,
        date: selectedDateTime,
      });

      newTable.reservation = reservation._id;
      newTable.isAvailable = false;
      await newTable.save();
      day.tables.push(newTable);
      await day.save();

      console.log("Reserved and new table created");
      res.status(200).json(reservation);
    }
  } catch (err) {
    console.error("Error occurred while reserving table:", err);
    res.status(500).send("Internal Server Error");
  }
};

// GET My Orders
const getMyOrders = async (req, res, next) => {
  // const { _id: userId } = req.user;
  const { userId } = req.query;
  console.log("UserId from req.user :: ", userId);
  try {
    const reservations = await Reservation.find({ userId })
      .populate("bookingDetails")
      .populate("table")
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json(reservations);
    console.log(reservations);
  } catch (err) {
    next(err);
  }
};

// DELETE an Order
// const deleteOrder = async (req, res, next) => {
//   const { reservationId } = req.query;
//   const { _id: userId } = req.user;

//   try {
//     // Find the reservation by both userId and reservationId
//     const deletedReservation = await Reservation.findOneAndDelete({
//       _id: reservationId,
//       userId: userId,
//     });

//     if (deletedReservation) {
//       console.log("Deleted reservation:", deletedReservation);
//       res.status(200).json({ message: "Reservation deleted successfully" });
//     } else {
//       console.log("Reservation not found.");
//       res.status(404).json({ message: "Reservation not found" });
//     }
//   } catch (error) {
//     console.error("Error deleting reservation:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export {
  reserveTable,
  getMyOrders,
  // deleteOrder
};

// const reserveTable = async (req, res, next) => {
//   console.log("Reservation Submitted");

//   const {
//     table: selectedTable,
//     date: selectedDateTime,
//     name,
//     phone,
//     email,
//   } = req.body;

//   const { userId } = req.query;

//   try {
//     // Find the requested table for the given date
//     const days = await Day.find({ date: selectedDateTime });
//     if (days.length > 0) {
//       const day = days[0];

//       // Find the requested table within the day's tables
//       // ? req.body.table return a tableNumber ? (it's being compared to t.number)
//       // ? customer chooses a table -> sending its id/ number to backend.
//       const table = day.tables.find((table) => table.number === selectedTable);

//       if (table) {
//         // Check if the table is available
//         if (table.isAvailable) {
//           // Create a new booking details record
//           const bookingDetails = new BookingDetails({
//             name,
//             phone,
//             email,
//           });
//           await bookingDetails.save();

//           // Create a new reservation
//           const reservation = new Reservation({
//             userId,
//             bookingDetails: bookingDetails._id,
//             table: table._id,
//             date: selectedDateTime,
//             // You can add more reservation details here if needed
//           });
//           await reservation.save();

//           // Update the table with reservation details
//           table.reservation = reservation._id;
//           table.isAvailable = false;
//           await day.save();

//           console.log("Reserved");
//           res.status(200).send("Added Reservation");
//         } else {
//           console.log("Table not available");
//           res.status(400).send("Table not available");
//         }
//       } else {
//         console.log("Table not found");
//         res.status(404).send("Table not found");
//       }
//     } else {
//       console.log("Day not found");
//       res.status(404).send("Day not found");
//     }
//   } catch (err) {
//     console.error("Error occurred while reserving table:", err);
//     res.status(500).send("Internal Server Error");
//   }
// };
