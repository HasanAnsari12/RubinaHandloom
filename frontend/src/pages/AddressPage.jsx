import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddressPage.css";

function AddressPage() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    house: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [savedAddresses, setSavedAddresses] =
    useState([]);

  useEffect(() => {
    const data =
      JSON.parse(
        localStorage.getItem("addresses")
      ) || [];

    setSavedAddresses(data);
  }, []);

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const saveAddress = (e) => {
    e.preventDefault();

    const updatedAddresses = [
      ...savedAddresses,
      address,
    ];

    localStorage.setItem(
      "addresses",
      JSON.stringify(updatedAddresses)
    );

    setSavedAddresses(updatedAddresses);

    setAddress({
      fullName: "",
      phone: "",
      house: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
    });

    setShowForm(false);
  };

  const deleteAddress = (index) => {
    const updated =
      savedAddresses.filter(
        (_, i) => i !== index
      );

    localStorage.setItem(
      "addresses",
      JSON.stringify(updated)
    );

    setSavedAddresses(updated);
  };

  return (
    <div className="address-page">

      <div className="address-container">

        <button
          className="back-btn"
          onClick={() =>
            navigate("/account")
          }
        >
          ← My Account
        </button>

        <div className="address-header">

          <div>
            <h1>📍 Address Book</h1>

            <p className="address-subtitle">
              Manage your delivery addresses
            </p>
          </div>

          <button
            className="add-address-btn"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            + Add New Address
          </button>

        </div>

        {showForm && (

          <form
            onSubmit={saveAddress}
            className="address-form"
          >

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={address.fullName}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={address.phone}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="house"
              placeholder="House / Flat No."
              value={address.house}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="area"
              placeholder="Area / Locality"
              value={address.area}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={address.pincode}
              onChange={handleChange}
              required
            />

            <button type="submit">
              Save Address
            </button>

          </form>

        )}

        <div className="saved-addresses">

          <h2>Saved Addresses</h2>

          {savedAddresses.length === 0 ? (

            <div className="empty-address">
              No Address Found
            </div>

          ) : (

            savedAddresses.map(
              (item, index) => (

                <div
                  key={index}
                  className="address-card"
                >

                  <span className="address-badge">
                    🏠 HOME
                  </span>

                  <h3>
                    {item.fullName}
                  </h3>

                  <p>{item.phone}</p>

                  <p>
                    {item.house},
                    {" "}
                    {item.area}
                  </p>

                  <p>
                    {item.city},
                    {" "}
                    {item.state}
                  </p>

                  <p>
                    {item.pincode}
                  </p>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteAddress(index)
                    }
                  >
                    Delete
                  </button>

                </div>

              )
            )

          )}

        </div>

      </div>

    </div>
  );
}

export default AddressPage;