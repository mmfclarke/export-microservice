require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.post('/export', (req, res) => {
  const { trip, costSummary } = req.body;
  if (!trip) {
    return res.status(400).json({ success: false, error: 'Trip data is required' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="trip_export.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(24).text('Trip Export', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(18).text('Trip Details');
  doc.fontSize(12).text(`Name: ${trip.tripName || 'N/A'}`);
  doc.text(`Destination: ${trip.destination || 'N/A'}`);
  doc.text(`Dates: ${trip.startDate} - ${trip.endDate}`);
  doc.text(`Travelers: ${trip.travelers || 'N/A'}`);
  doc.moveDown();

  if (costSummary) {
    doc.fontSize(18).text('Cost Summary');
    doc.fontSize(12).text(`Total Cost: $${costSummary.total ? costSummary.total.toFixed(2) : '0.00'}`);
    doc.text(`Cost Per Traveler: $${costSummary.perTraveler ? costSummary.perTraveler.toFixed(2) : '0.00'}`);
    doc.moveDown();
  }

  doc.fontSize(18).text('Itinerary');
  if (Array.isArray(trip.itinerary) && trip.itinerary.length > 0) {
    trip.itinerary.forEach((day, i) => {
      doc.fontSize(14).text(`Day ${i + 1}`);
      if (Array.isArray(day.activities) && day.activities.length > 0) {
        day.activities.forEach((act, j) => {
          doc.fontSize(12).text(`${j + 1}. ${act.activity || 'Unnamed Activity'}${act.startTime ? ` - ${act.startTime}` : ''}`);
          doc.fontSize(11).text(`   Cost: ${act.cost ? `$${parseFloat(act.cost).toFixed(2)}` : 'N/A'}`);
          doc.text(`   Notes: ${act.notes || 'None'}`);
        });
      } else {
        doc.fontSize(11).text('   No activities planned for this day.');
      }
      doc.moveDown();
    });
  } else {
    doc.fontSize(12).text('No itinerary available.');
  }

  doc.end();
});

app.listen(PORT, () => {
  console.log(`Trip Export Microservice running on port ${PORT}`);
});