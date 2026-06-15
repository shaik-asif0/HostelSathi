import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current active bookings or visits
  visits: [], 
  // Dues to be paid (e.g. rent)
  dues: [
    {
      _id: 'due1',
      hostelName: 'Miyapur Metro View PG',
      month: 'May 2024',
      amount: 4500,
      dueDate: '2024-05-05',
      status: 'pending' // pending, paid
    }
  ],
  // Payment history
  receipts: [
    {
      _id: 'rec1',
      hostelName: 'Miyapur Metro View PG',
      month: 'April 2024',
      amount: 4500,
      paidOn: '2024-04-02',
      transactionId: 'TXN1029384756',
      status: 'success'
    }
  ]
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    bookVisit: (state, action) => {
      // payload: { hostelId, hostelName, date, time, roomType, message }
      const newVisit = {
        _id: 'visit_' + Date.now(),
        status: 'scheduled',
        ...action.payload
      };
      state.visits.push(newVisit);
    },
    payDue: (state, action) => {
      // payload: dueId
      const dueIndex = state.dues.findIndex(d => d._id === action.payload);
      if (dueIndex >= 0) {
        const paidDue = state.dues[dueIndex];
        // Remove from dues
        state.dues.splice(dueIndex, 1);
        // Add to receipts
        state.receipts.unshift({
          _id: 'rec_' + Date.now(),
          hostelName: paidDue.hostelName,
          month: paidDue.month,
          amount: paidDue.amount,
          paidOn: new Date().toISOString().split('T')[0],
          transactionId: 'TXN' + Math.floor(Math.random() * 1000000000),
          status: 'success'
        });
      }
    },
    addReceipt: (state, action) => {
      state.receipts.unshift(action.payload);
    }
  }
});

export const { bookVisit, payDue, addReceipt } = bookingsSlice.actions;
export default bookingsSlice.reducer;
