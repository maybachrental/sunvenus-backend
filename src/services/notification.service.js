const { sendMail } = require("../config/mailer");
const { Users, Bookings, Cars, CarCategories } = require("../models");
const { carRentalConfirmationTemplate } = require("../utils/emailTemplates");
const { bookingStatus } = require("../utils/staticExport");

const sendBookingSuccessNotification = async (data) => {
  try {
    const { booking_id, user_id } = data;
    if (!booking_id || !user_id) return;
    const user = await Users.findOne({
      where: { id: user_id },
      attributes: ["id", "name", "email", "phone"],
    });
    const bookingData = await Bookings.findOne({
      where: { id: booking_id, booking_status: bookingStatus.CONFIRMED },
      include: [
        {
          model: Cars,
          include: [
            {
              model: CarCategories,
            },
          ],
        },
      ],
    });

    if (!user || !bookingData) {
      return console.log("Users or Booking not found");
    }
    const booking = bookingData.get({ plain: true });
    const htmlData = {
      customerName: user.name,
      bookingId: booking.booking_code,
      carName: booking?.Car?.name || "Car name",
      carCategory: booking?.Car?.CarCategory?.category || "Car Category",
      pickupDate: new Date(booking.pickup_datetime).toLocaleString(),
      pickupTime: "",
      returnDate: new Date(booking.drop_datetime).toLocaleString(),
      returnTime: "",
      pickupLocation: booking.pickup_location,
      dropoffLocation: booking?.drop_location ? booking.drop_location : booking.pickup_location,
      rentalDays: 1,
      basePrice: booking.base_price,
      insuranceFee: 0,
      airportSurcharge: 0,
      taxAmount: 0,
      totalAmount: booking.total_price,
    };
    const html = carRentalConfirmationTemplate(htmlData);
    await sendMail(
      user.email, // client's email from env
      "Your Booking has been confirmed ",
      html,
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendBookingSuccessNotification };
