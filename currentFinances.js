const CostOfLivingForm = () => {
    const handleSubmit = (event) => {
      event.preventDefault();
  
      const getFieldValue = (id) => {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) || 0 : 0;
      };
    
      const sectionInputs = {
        'Home/Rent': getFieldValue('Home-Rent'),
        'Cost of Living': {
          Food: getFieldValue('Food'),
          Gas: getFieldValue('Gas'),
          'Eating Out': getFieldValue('Eating-Out'),
          Entertainment: getFieldValue('Entertainment'),
          Donations: getFieldValue('Donations'),
          Miscellaneous: getFieldValue('Miscellaneous'),
          Other: getFieldValue('Other-Cost')
        },
        Insurance: {
          'Car(s)': getFieldValue('Car-s'),
          Health: getFieldValue('Health'),
          Life: getFieldValue('Life'),
          Other: getFieldValue('Other-Insurance')
        },
        Utilities: {
          Phone: getFieldValue('Phone'),
          Water: getFieldValue('Water'),
          Gas: getFieldValue('Gas-Utility'),
          Solar: getFieldValue('Solar'),
          Pest: getFieldValue('Pest'),
          Internet: getFieldValue('Internet'),
          Other: getFieldValue('Other-Utility')
        }
      };
    
      const sectionTotals = {};
    
      // Calculate section totals
      Object.entries(sectionInputs).forEach(([section, fields]) => {
        let total = 0;
        if (typeof fields === 'object') {
          total = Object.values(fields).reduce((acc, val) => acc + val, 0);
        } else {
          total = fields;
        }
        sectionTotals[section] = total.toFixed(2);
      });
    
      // Calculate overall total
      const overallTotal = Object.values(sectionTotals).reduce((acc, val) => acc + parseFloat(val), 0).toFixed(2);
    
      // Render the table with section totals and overall total
      const root = document.getElementById('root');
      root.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Section</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(sectionTotals)
              .map(([section, total]) => `
                <tr>
                  <td>${section}</td>
                  <td>$${total}</td>
                </tr>
              `)
              .join('')}
            <tr>
              <td>Overall Total</td>
              <td>$${overallTotal}</td>
            </tr>
          </tbody>
        </table>
        <button id="resetButton">Retake Form</button>
      `;
    
      // Add event listener to the reset button
      const resetButton = document.getElementById('resetButton');
      resetButton.addEventListener('click', handleReset);
    };
    
    const handleReset = () => {
      const root = document.getElementById('root');
      root.innerHTML = '';
      root.appendChild(CostOfLivingForm());
    };
  
    const form = document.createElement('form');
    form.addEventListener('submit', handleSubmit);
  
    // Add form fields
    const sections = [
      {
        title: 'Home/Rent',
        fields: ['Home/Rent']
      },
      {
        title: 'Cost of Living',
        fields: ['Food', 'Gas', 'Eating Out', 'Entertainment', 'Donations', 'Miscellaneous', 'Other']
      },
      {
        title: 'Insurance',
        fields: ['Car(s)', 'Health', 'Life', 'Other']
      },
      {
        title: 'Utilities',
        fields: ['Phone', 'Water', 'Gas', 'Solar', 'Pest', 'Internet', 'Other']
      }
    ];
  
    sections.forEach((section) => {
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = section.title;
      fieldset.appendChild(legend);
  
      section.fields.forEach((field) => {
        const label = document.createElement('label');
        label.textContent = field;
        const input = document.createElement('input');
        input.type = 'number';
        input.id = field.toLowerCase().replace(/\s/g, '-');
  
        const fieldContainer = document.createElement('div');
        fieldContainer.appendChild(label);
        fieldContainer.appendChild(input);
        fieldset.appendChild(fieldContainer);
      });
  
      form.appendChild(fieldset);
    });
  
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Calculate Totals';
    form.appendChild(submitButton);
  
    return form;
  };
  
  const root = document.getElementById('root');
  root.appendChild(CostOfLivingForm());
  