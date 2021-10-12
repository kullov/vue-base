<template>
  <div style="height: 100%">
    <div class="example-wrapper">
        <div class="example-header">
            <div style="padding: 4px;">
                <button v-on:click="clearPinned()">Clear Pinned</button>
                <button v-on:click="resetPinned()">Left = #, Athlete, Age; Right = Total</button>
                <button v-on:click="pinCountry()">Left = Country</button>
            </div>
        
            <div style="padding: 4px;">
                Jump to:
                <input placeholder="row" type="text" style="width: 40px" id="row" v-on:input="jumpToRow()">
                <input placeholder="col" type="text" style="width: 40px" id="col" v-on:input="jumpToCol()">
            </div>
        </div>
        <ag-grid-vue
        style="width: 100%; height: 100%;"
        class="ag-theme-alpine"
        id="myGrid"
        :columnDefs="columnDefs"
        @grid-ready="onGridReady"
        :defaultColDef="defaultColDef"
        :debug="true"
        :rowData="rowData"></ag-grid-vue>
    </div>
</div>
</template>
<script>
export default {
  name: 'AggridComponent',
  data() {
    return {
      columnDefs: [
        {
          headerName: '#',
          colId: 'rowNum',
          valueGetter: 'node.id',
          width: 80,
          pinned: 'left',
        },
        { headerName: 'Athlete', field: 'athlete', width: 150, pinned: 'left' },
        { headerName: 'Age', field: 'age', width: 90, pinned: 'left' },
        { headerName: 'Country', field: 'country', width: 150 },
        { headerName: 'Year', field: 'year', width: 90 },
        { headerName: 'Date', field: 'date', width: 110 },
        { headerName: 'Sport', field: 'sport', width: 150 },
        { headerName: 'Gold', field: 'gold', width: 100 },
        { headerName: 'Silver', field: 'silver', width: 100 },
        { headerName: 'Bronze', field: 'bronze', width: 100 },
        { headerName: 'Total', field: 'total', width: 100, pinned: 'right' },
      ],
      gridApi: null,
      columnApi: null,
      defaultColDef: { resizable: true },
      rowData: null,
    };
  },
  beforeMount() {},
  methods: {
    clearPinned() {
      this.gridColumnApi.applyColumnState({ defaultState: { pinned: null } });
    },
    resetPinned() {
      this.gridColumnApi.applyColumnState({
        state: [
          {
            colId: 'rowNum',
            pinned: 'left',
          },
          {
            colId: 'athlete',
            pinned: 'left',
          },
          {
            colId: 'age',
            pinned: 'left',
          },
          {
            colId: 'total',
            pinned: 'right',
          },
        ],
        defaultState: { pinned: null },
      });
    },
    pinCountry() {
      this.gridColumnApi.applyColumnState({
        state: [
          {
            colId: 'country',
            pinned: 'left',
          },
        ],
        defaultState: { pinned: null },
      });
    },
    jumpToCol() {
      var value = document.getElementById('col').value;
      if (typeof value !== 'string' || value === '') {
        return;
      }
      var index = Number(value);
      if (typeof index !== 'number' || isNaN(index)) {
        return;
      }
      var allColumns = this.gridColumnApi.getAllColumns();
      var column = allColumns[index];
      if (column) {
        this.gridApi.ensureColumnVisible(column);
      }
    },
    jumpToRow(value) {
      var value = document.getElementById('row').value;
      var index = Number(value);
      if (typeof index === 'number' && !isNaN(index)) {
        this.gridApi.ensureIndexVisible(index);
      }
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;

      const updateData = (data) => {
        this.rowData = data;
      };

      fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((resp) => resp.json())
        .then((data) => updateData(data));
    },
  },
}
</script>
<style lang="scss" scoped>
.example-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

#myGrid {
  flex: 1 1 0px;
  width: 100%;
}

.example-header {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-size: 13px;
  margin-bottom: 5px;
}
</style>