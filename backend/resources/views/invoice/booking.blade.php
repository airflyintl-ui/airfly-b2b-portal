<!DOCTYPE html>
<html>

<head>

<meta charset="utf-8">

<style>

body{

font-family:DejaVu Sans;

font-size:14px;

}

table{

width:100%;

border-collapse:collapse;

}

td,th{

border:1px solid #ccc;

padding:8px;

}

h2{

text-align:center;

}

</style>

</head>

<body>

<h2>

AIR FLY INTERNATIONAL

</h2>

<h3 align="center">

Booking Invoice

</h3>

<table>

<tr>

<th>PNR</th>

<td>{{ $booking->pnr }}</td>

</tr>

<tr>

<th>Passenger</th>

<td>{{ $booking->passenger_name }}</td>

</tr>

<tr>

<th>Passport</th>

<td>{{ $booking->passport }}</td>

</tr>

<tr>

<th>Airline</th>

<td>{{ $booking->airline }}</td>

</tr>

<tr>

<th>Flight</th>

<td>{{ $booking->flight_no }}</td>

</tr>

<tr>

<th>Route</th>

<td>{{ $booking->from }} → {{ $booking->to }}</td>

</tr>

<tr>

<th>Departure</th>

<td>{{ $booking->departure_date }}</td>

</tr>

<tr>

<th>Amount</th>

<td>৳ {{ number_format($booking->amount,2) }}</td>

</tr>

<tr>

<th>Status</th>

<td>{{ $booking->status }}</td>

</tr>

</table>

<br>

<h4 align="center">

Thank you for choosing AIR FLY INTERNATIONAL

</h4>

</body>

</html>