import { Container, TextField, Typography } from "@mui/material";
import debounce from "lodash.debounce";
import { useEffect, useMemo, useState } from "react";
import * as accountService from "../../../services/account-service";
import SecurityTable from "./SecurityTable";

const SecurityAdminDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await accountService.getAll();
        setAccounts(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (accounts.length === 0) return undefined;
    if (search.length === 0) {
      setError("");
      setFilteredAccounts(accounts);
    } else {
      const result = accounts.filter((account) => {
        return (
          account.firstName.toLowerCase().includes(search) ||
          account.lastName.toLowerCase().includes(search) ||
          account.email.toLowerCase().includes(search)
        );
      });
      result.length === 0
        ? setError("User does not Exist")
        : setFilteredAccounts(result);
    }
  }, [search, accounts]);

  const debouncedChangeHandler = useMemo(() => {
    const changeHandler = (event) => {
      setSearch(event.target.value.toLowerCase());
    };
    return debounce(changeHandler, 300);
  }, [setSearch]);

  const handlePermissionChange = (userId, permission, value) => {
    const account = filteredAccounts.find((row) => {
      return row.id === userId;
    });
    if (account) {
      if (permission === "is_admin") {
        account["isAdmin"] = value;
      } else if (permission === "is_coordinator") {
        account["isCoordinator"] = value;
      } else if (permission === "is_security_admin") {
        account["isSecurityAdmin"] = value;
      } else if (permission === "is_data_entry") {
        account["isDataEntry"] = value;
      } else if (permission === "is_global_admin") {
        account["isGlobalAdmin"] = value;
      } else if (permission === "is_global_reporting") {
        account["isGlobalReporting"] = value;
      }
    }
    let filtered = [...filteredAccounts, { ...account }];
    const unique = [
      ...new Map(filtered.map((item) => [item.id, item])).values(),
    ];
    setFilteredAccounts(unique);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        "&.MuiContainer-root": {
          textAlign: "center",
          padding: "2rem",
        },
      }}
    >
      <Typography variant="h4">Security Roles</Typography>
      <Typography variant="h6">Grant or Revoke Permissions</Typography>
      <TextField
        sx={{
          marginBottom: "10px",
        }}
        variant="outlined"
        margin="none"
        placeholder="Find"
        size="small"
        onChange={debouncedChangeHandler}
      />
      {error === "User does not Exist" ? (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      ) : (
        <SecurityTable
          accounts={filteredAccounts}
          handlePermissionChange={handlePermissionChange}
        />
      )}
    </Container>
  );
};

export default SecurityAdminDashboard;
